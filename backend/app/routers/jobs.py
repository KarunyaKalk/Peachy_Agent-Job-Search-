from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel, HttpUrl

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.routers.profile import _get_or_create_profile
from app.models.user import User
from app.models.job import JobSeen
from app.schemas.job import JobResponse, JobStatusUpdate, JobSearchTriggerResponse
from app.services.adzuna_service import AdzunaJobDiscoveryService
from app.services.wellfound_scraper import WellfoundScraperService
from app.services.haveloc_scraper import HavelocScraperService
from app.services.linkedin_parser import LinkedInSingleJobParser
from app.services.match_scorer import MatchScorer

router = APIRouter(prefix="/jobs", tags=["jobs"])

adzuna_service = AdzunaJobDiscoveryService()
wellfound_service = WellfoundScraperService()
haveloc_service = HavelocScraperService()
linkedin_parser = LinkedInSingleJobParser()


class LinkedInImportRequest(BaseModel):
    url: str


@router.get("", response_model=List[JobResponse])
def get_discovered_jobs(
    view_mode: str = Query("all", enum=["all", "saved", "discarded"]),
    source_platform: Optional[str] = Query(None, enum=["Adzuna", "Wellfound", "Haveloc", "LinkedIn"]),
    search: Optional[str] = None,
    min_score: int = Query(60, ge=0, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    query = db.query(JobSeen).filter(JobSeen.user_id == current_user.id)

    if view_mode == "saved":
        query = query.filter(JobSeen.is_saved == True)
    elif view_mode == "discarded":
        query = query.filter(JobSeen.is_discarded == True)
    else:
        # Default "all" view excludes explicitly discarded jobs
        query = query.filter(JobSeen.is_discarded == False)

    if source_platform:
        query = query.filter(JobSeen.source_platform == source_platform)

    # Filter out scores below threshold (default 60)
    if min_score > 0:
        query = query.filter(JobSeen.relevance_score >= min_score)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (JobSeen.title.ilike(search_filter))
            | (JobSeen.company.ilike(search_filter))
            | (JobSeen.location.ilike(search_filter))
        )

    jobs = query.order_by(JobSeen.relevance_score.desc(), JobSeen.created_at.desc()).all()
    return jobs


@router.post("/search", response_model=JobSearchTriggerResponse)
async def trigger_multi_source_job_search(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    prefs = profile.preferences
    if not prefs:
        raise HTTPException(status_code=400, detail="Job preferences not found.")

    total_new_added = 0
    total_dedup = 0
    total_discarded = 0

    # 1. Adzuna Scan
    adz_new, adz_dedup, adz_disc, _ = await adzuna_service.scan_jobs_for_preferences(db, current_user.id, prefs)
    total_new_added += adz_new
    total_dedup += adz_dedup
    total_discarded += adz_disc

    # 2. Wellfound Scan
    wf_items = await wellfound_service.scrape_wellfound_jobs(prefs)
    # 3. Haveloc Scan
    hv_items = await haveloc_service.scrape_haveloc_jobs(prefs)

    other_items = []
    for item in wf_items:
        item["source_platform"] = "Wellfound"
        other_items.append(item)
    for item in hv_items:
        item["source_platform"] = "Haveloc"
        other_items.append(item)

    for item in other_items:
        dedup_hash = JobSeen.generate_hash(item["apply_url"], item["title"], item["company"])
        existing = db.query(JobSeen).filter(JobSeen.dedup_hash == dedup_hash).first()
        if existing:
            total_dedup += 1
            continue

        score = MatchScorer.calculate_relevance(
            item["title"], item["company"], item["location"], item["jd_text"],
            item.get("salary_min"), item.get("salary_max"), profile, prefs
        )

        # Skip if score below auto-discard floor (40)
        if score < 40:
            total_discarded += 1
            continue

        new_job = JobSeen(
            user_id=current_user.id,
            dedup_hash=dedup_hash,
            title=item["title"],
            company=item["company"],
            location=item["location"],
            jd_text=item["jd_text"],
            salary_min=item.get("salary_min"),
            salary_max=item.get("salary_max"),
            salary_currency="USD",
            seniority=item.get("seniority", "Senior"),
            source_platform=item["source_platform"],
            posted_date=item.get("posted_date", "Today"),
            apply_url=item["apply_url"],
            relevance_score=score,
            is_saved=False,
            is_discarded=False,
        )
        db.add(new_job)
        total_new_added += 1

    db.commit()

    all_jobs = (
        db.query(JobSeen)
        .filter(JobSeen.user_id == current_user.id, JobSeen.is_discarded == False, JobSeen.relevance_score >= 60)
        .order_by(JobSeen.relevance_score.desc())
        .all()
    )

    return {
        "scanned_roles": prefs.target_roles or [],
        "total_found": len(all_jobs),
        "new_jobs_added": total_new_added,
        "deduplicated_count": total_dedup,
        "discarded_filtered": total_discarded,
        "jobs": all_jobs,
    }


@router.post("/linkedin-import", response_model=JobResponse)
async def import_single_linkedin_job(
    request_data: LinkedInImportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = _get_or_create_profile(db, current_user.id)
    url = request_data.url.strip()

    if not url:
        raise HTTPException(status_code=400, detail="LinkedIn URL is required.")

    item = await linkedin_parser.parse_linkedin_url(url)
    dedup_hash = JobSeen.generate_hash(item["apply_url"], item["title"], item["company"])

    existing = db.query(JobSeen).filter(JobSeen.dedup_hash == dedup_hash, JobSeen.user_id == current_user.id).first()
    if existing:
        return existing

    score = MatchScorer.calculate_relevance(
        item["title"], item["company"], item["location"], item["jd_text"],
        item.get("salary_min"), item.get("salary_max"), profile, profile.preferences
    )

    new_job = JobSeen(
        user_id=current_user.id,
        dedup_hash=dedup_hash,
        title=item["title"],
        company=item["company"],
        location=item["location"],
        jd_text=item["jd_text"],
        salary_min=item.get("salary_min"),
        salary_max=item.get("salary_max"),
        salary_currency="USD",
        seniority="Senior",
        source_platform="LinkedIn",
        posted_date="Imported",
        apply_url=item["apply_url"],
        relevance_score=max(score, 88),  # Explicit user imports get high baseline relevance
        is_saved=True,  # Auto-bookmark user manually imported jobs
        is_discarded=False,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.put("/{job_id}/status", response_model=JobResponse)
def update_job_status(
    job_id: int,
    status_update: JobStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    job = db.query(JobSeen).filter(JobSeen.id == job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    if status_update.is_saved is not None:
        job.is_saved = status_update.is_saved
    if status_update.is_discarded is not None:
        job.is_discarded = status_update.is_discarded

    db.commit()
    db.refresh(job)
    return job
