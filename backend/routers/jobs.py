from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from backend.database import get_db
from backend.models.job import Job
from backend.models.profile import MasterProfile, JobPreference
from backend.schemas.job import JobResponse, JobCreate, LinkedInParseRequest
from backend.services.discovery_service import discovery_service
from backend.services.playwright_scraper import playwright_scraper

router = APIRouter(prefix="/api/jobs", tags=["Jobs Discovery"])

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    min_score: float = Query(0.0),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve discovered jobs feed filtered by score and search query."""
    query = select(Job).where(Job.is_hidden == False).where(Job.match_score >= min_score)
    if search:
        query = query.where(Job.title.ilike(f"%{search}%") | Job.company.ilike(f"%{search}%"))
        
    query = query.order_by(Job.match_score.desc(), Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    # If table is empty, seed initial discovery batch
    if not jobs:
        await trigger_discovery_scan(db)
        result = await db.execute(query)
        jobs = result.scalars().all()
        
    return jobs

@router.post("/scan")
async def trigger_discovery_scan(db: AsyncSession = Depends(get_db)):
    """Trigger job discovery scan across Adzuna API, Wellfound, and Haveloc."""
    # Fetch master profile & preferences
    prof_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = prof_res.scalars().first() or MasterProfile()
    
    pref_res = await db.execute(select(JobPreference).order_by(JobPreference.id.asc()))
    pref = pref_res.scalars().first() or JobPreference()
    
    profile_dict = {
        "summary": profile.summary,
        "skills_json": profile.skills_json or {},
        "keyword_fingerprint": profile.keyword_fingerprint or []
    }
    pref_dict = {
        "target_roles": pref.target_roles or ["Software Engineer"],
        "location_types": pref.location_types or ["Remote"],
        "exclude_keywords": pref.exclude_keywords or []
    }

    # Fetch jobs from discovery service
    raw_jobs = await discovery_service.fetch_adzuna_jobs()
    wellfound_jobs = await playwright_scraper.scrape_wellfound_jobs()
    all_raw = raw_jobs + wellfound_jobs

    added_count = 0
    for raw in all_raw:
        dedup_hash = discovery_service.generate_dedup_hash(raw["title"], raw["company"], raw["apply_url"])
        
        # Check if exists
        existing = await db.execute(select(Job).where(Job.dedup_hash == dedup_hash))
        if existing.scalars().first():
            continue
            
        score = discovery_service.calculate_match_score(raw, profile_dict, pref_dict)
        
        job_record = Job(
            dedup_hash=dedup_hash,
            title=raw["title"],
            company=raw["company"],
            location=raw["location"],
            salary_range=raw.get("salary_range"),
            seniority=raw.get("seniority"),
            job_type=raw.get("job_type", "Remote"),
            full_jd_text=raw["full_jd_text"],
            source_platform=raw["source_platform"],
            apply_url=raw["apply_url"],
            posted_date=raw.get("posted_date"),
            match_score=score,
            is_hidden=(score < pref.salary_floor / 3000.0 if pref.salary_floor else False)
        )
        db.add(job_record)
        added_count += 1
        
    await db.commit()
    return {"status": "SUCCESS", "new_jobs_added": added_count}

@router.post("/parse-linkedin", response_model=JobResponse)
async def parse_linkedin_url(req: LinkedInParseRequest, db: AsyncSession = Depends(get_db)):
    """
    Module 2: LinkedIn manual-assist mode only.
    Parses single LinkedIn job URL and saves JD details.
    """
    raw_data = await playwright_scraper.scrape_linkedin_job_url(req.url)
    
    prof_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = prof_res.scalars().first() or MasterProfile()
    pref_res = await db.execute(select(JobPreference).order_by(JobPreference.id.asc()))
    pref = pref_res.scalars().first() or JobPreference()
    
    profile_dict = {"summary": profile.summary, "keyword_fingerprint": profile.keyword_fingerprint or []}
    pref_dict = {"target_roles": pref.target_roles or [], "location_types": pref.location_types or [], "exclude_keywords": pref.exclude_keywords or []}
    
    dedup_hash = discovery_service.generate_dedup_hash(raw_data["title"], raw_data["company"], raw_data["apply_url"])
    
    existing = await db.execute(select(Job).where(Job.dedup_hash == dedup_hash))
    job_record = existing.scalars().first()
    
    if not job_record:
        score = discovery_service.calculate_match_score(raw_data, profile_dict, pref_dict)
        job_record = Job(
            dedup_hash=dedup_hash,
            title=raw_data["title"],
            company=raw_data["company"],
            location=raw_data["location"],
            full_jd_text=raw_data["full_jd_text"],
            source_platform="LinkedIn-Manual",
            apply_url=raw_data["apply_url"],
            match_score=score
        )
        db.add(job_record)
        await db.commit()
        await db.refresh(job_record)
        
    return job_record

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_detail(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    return job
