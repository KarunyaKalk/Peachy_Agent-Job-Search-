import os
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.models.profile import MasterProfile, JobPreferences
from app.models.job import JobSeen
from app.services.adzuna_service import AdzunaJobDiscoveryService
from app.services.wellfound_scraper import WellfoundScraperService
from app.services.haveloc_scraper import HavelocScraperService
from app.services.match_scorer import MatchScorer

scheduler = AsyncIOScheduler()
adzuna_service = AdzunaJobDiscoveryService()
wellfound_service = WellfoundScraperService()
haveloc_service = HavelocScraperService()


async def run_recurring_job_discovery():
    """
    Background worker function executed every N hours by APScheduler.
    Scans Adzuna, Wellfound, and Haveloc for all active users.
    """
    print("[APScheduler] Executing scheduled multi-source job discovery scan...")
    db: Session = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            profile = db.query(MasterProfile).filter(MasterProfile.user_id == user.id).first()
            if not profile or not profile.preferences:
                continue

            prefs = profile.preferences
            all_raw = []

            # 1. Adzuna Scan
            _, _, _, adzuna_jobs = await adzuna_service.scan_jobs_for_preferences(db, user.id, prefs)

            # 2. Wellfound Scan
            wf_items = await wellfound_service.scrape_wellfound_jobs(prefs)
            for item in wf_items:
                item["source_platform"] = "Wellfound"
                all_raw.append(item)

            # 3. Haveloc Scan
            hv_items = await haveloc_service.scrape_haveloc_jobs(prefs)
            for item in hv_items:
                item["source_platform"] = "Haveloc"
                all_raw.append(item)

            # Process & deduplicate Wellfound + Haveloc items
            for item in all_raw:
                dedup_hash = JobSeen.generate_hash(item["apply_url"], item["title"], item["company"])
                existing = db.query(JobSeen).filter(JobSeen.dedup_hash == dedup_hash).first()
                if existing:
                    continue

                score = MatchScorer.calculate_relevance(
                    item["title"], item["company"], item["location"], item["jd_text"],
                    item.get("salary_min"), item.get("salary_max"), profile, prefs
                )

                new_job = JobSeen(
                    user_id=user.id,
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

            db.commit()
            print(f"[APScheduler] Multi-source scan completed for user ID {user.id}.")
    except Exception as e:
        print(f"[APScheduler Error] Recurring scan failed: {e}")
    finally:
        db.close()


def start_job_scheduler(scan_interval_hours: int = 6):
    """Start APScheduler background job runner."""
    if not scheduler.running:
        scheduler.add_job(
            run_recurring_job_discovery,
            "interval",
            hours=scan_interval_hours,
            id="recurring_job_discovery",
            replace_existing=True,
        )
        scheduler.start()
        print(f"[APScheduler] Started recurring job scan task every {scan_interval_hours} hours.")
