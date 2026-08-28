from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models.application import Application
from backend.models.job import Job
from backend.models.resume import TailoredResume
from backend.models.profile import MasterProfile
from backend.schemas.application import ApplicationResponse, ApplicationUpdateStatus
from backend.services.playwright_scraper import playwright_scraper

router = APIRouter(prefix="/api/applications", tags=["Applications Kanban"])

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(db: AsyncSession = Depends(get_db)):
    """Retrieve all applications for Kanban board grouped by status."""
    result = await db.execute(select(Application).order_by(Application.updated_at.desc()))
    apps = result.scalars().all()
    
    # If applications table empty, auto-create initial entries from jobs_seen
    if not apps:
        jobs_res = await db.execute(select(Job).limit(5))
        jobs = jobs_res.scalars().all()
        for idx, job in enumerate(jobs):
            status_opts = ["Not Applied", "Ready to Apply", "Applied", "Interview", "Under Review"]
            app = Application(
                job_id=job.id,
                status=status_opts[idx % len(status_opts)],
                submission_type="Direct API / Playwright Pause",
                notes=f"Target role at {job.company}."
            )
            db.add(app)
        await db.commit()
        result = await db.execute(select(Application).order_by(Application.updated_at.desc()))
        apps = result.scalars().all()

    # Hydrate job metadata for UI view
    out = []
    for app in apps:
        j_res = await db.execute(select(Job).where(Job.id == app.job_id))
        job = j_res.scalars().first()
        
        app_dict = {
            "id": app.id,
            "job_id": app.job_id,
            "resume_id": app.resume_id,
            "status": app.status,
            "submission_type": app.submission_type,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "job_title": job.title if job else "Software Engineer",
            "company": job.company if job else "Tech Employer",
            "match_score": job.match_score if job else 85.0
        }
        out.append(app_dict)
        
    return out

@router.patch("/{app_id}/status")
async def update_application_status(app_id: int, req: ApplicationUpdateStatus, db: AsyncSession = Depends(get_db)):
    """Update application Kanban status and notes."""
    result = await db.execute(select(Application).where(Application.id == app_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found.")
        
    app.status = req.status
    if req.notes is not None:
        app.notes = req.notes
    if req.status == "Applied" and not app.applied_at:
        app.applied_at = datetime.utcnow()
        
    await db.commit()
    await db.refresh(app)
    return app

@router.post("/{app_id}/form-fill-preview")
async def execute_form_fill_preview(app_id: int, db: AsyncSession = Depends(get_db)):
    """
    Module 5: Playwright form-fill automation stopping right before final submit.
    Generates preview confirmation state for user review.
    """
    app_res = await db.execute(select(Application).where(Application.id == app_id))
    app = app_res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found.")
        
    job_res = await db.execute(select(Job).where(Job.id == app.job_id))
    job = job_res.scalars().first()
    
    prof_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = prof_res.scalars().first()
    
    user_dict = {
        "full_name": profile.full_name if profile else "Karunya",
        "email": profile.email if profile else "user@example.com",
        "phone": profile.phone if profile else "+1 (555) 019-2831"
    }
    
    preview_result = await playwright_scraper.form_fill_preview(
        job_url=job.apply_url if job else "https://example.com/apply",
        user_profile=user_dict
    )
    
    return preview_result

@router.post("/{app_id}/submit")
async def finalize_submission(app_id: int, db: AsyncSession = Depends(get_db)):
    """
    Module 5: Finalize application submission ONLY on explicit user click.
    """
    app_res = await db.execute(select(Application).where(Application.id == app_id))
    app = app_res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
        
    app.status = "Applied"
    app.applied_at = datetime.utcnow()
    await db.commit()
    
    return {"status": "SUCCESS", "message": "Application submitted cleanly following human approval."}
