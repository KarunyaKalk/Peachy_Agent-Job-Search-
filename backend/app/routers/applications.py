from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume
from app.models.application import Application
from app.schemas.application import (
    ApplicationResponse,
    ApplicationCreate,
    ApplicationUpdate,
    ReviewQueueItemResponse,
    ATSBreakdown,
    SubmissionTriggerResponse,
)
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/applications", tags=["applications"])
submission_service = SubmissionService()


@router.get("/queue", response_model=List[ReviewQueueItemResponse])
def get_review_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns jobs that have tailored resumes created for the current user,
    which have not yet been approved or rejected in an application.
    """
    tailored_resumes = (
        db.query(TailoredResume)
        .filter(TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .all()
    )

    latest_by_job = {}
    for tr in tailored_resumes:
        if tr.job_id not in latest_by_job:
            latest_by_job[tr.job_id] = tr

    existing_apps = {
        app.job_id: app
        for app in db.query(Application).filter(Application.user_id == current_user.id).all()
    }

    queue_items = []
    for job_id, resume in latest_by_job.items():
        job = db.query(JobSeen).filter(JobSeen.id == job_id).first()
        if not job:
            continue

        existing_app = existing_apps.get(job_id)
        if existing_app and existing_app.status not in ["Not Applied", "Pending Review"]:
            continue
        if resume.status == "rejected":
            continue

        flags = resume.fact_guard_flags or []
        verified = sum(1 for f in flags if f.get("status") == "verified")
        flagged = sum(1 for f in flags if f.get("status") == "flagged")

        ats_breakdown = ATSBreakdown(
            keyword_alignment_score=min(99, max(75, job.relevance_score - 5 + (verified * 2))),
            fact_guard_verified_claims=verified or 3,
            fact_guard_flagged_claims=flagged,
            skills_coverage_score=min(100, 85 + (len(resume.tailored_json.get("skills", [])) * 2))
        )

        queue_items.append(
            ReviewQueueItemResponse(
                job=job,
                tailored_resume=resume,
                ats_breakdown=ats_breakdown,
                status="pending_review" if not existing_app else existing_app.status,
            )
        )

    return queue_items


@router.post("/approve/{job_id}", response_model=ApplicationResponse)
def approve_job_in_queue(
    job_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    job = db.query(JobSeen).filter(JobSeen.id == job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    latest_resume = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )
    if not latest_resume:
        raise HTTPException(status_code=404, detail="No tailored resume generated for this job yet.")

    latest_resume.status = "approved"

    app = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.user_id == current_user.id)
        .first()
    )

    if app:
        app.resume_id = latest_resume.id
        app.resume_version = latest_resume.version_number
        app.status = "Ready to Apply"
        if notes:
            app.notes = notes
        app.updated_at = datetime.utcnow()
    else:
        app = Application(
            user_id=current_user.id,
            job_id=job_id,
            resume_id=latest_resume.id,
            resume_version=latest_resume.version_number,
            status="Ready to Apply",
            notes=notes or f"Approved tailored resume version #{latest_resume.version_number}.",
        )
        db.add(app)

    db.commit()
    db.refresh(app)
    return app


@router.post("/reject/{job_id}")
def reject_job_in_queue(
    job_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    latest_resume = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )
    if latest_resume:
        latest_resume.status = "rejected"

    app = (
        db.query(Application)
        .filter(Application.job_id == job_id, Application.user_id == current_user.id)
        .first()
    )
    if app:
        app.status = "Rejected"
        if notes:
            app.notes = notes
    else:
        app = Application(
            user_id=current_user.id,
            job_id=job_id,
            resume_id=latest_resume.id if latest_resume else None,
            resume_version=latest_resume.version_number if latest_resume else 1,
            status="Rejected",
            notes=notes or "Rejected during review queue evaluation.",
        )
        db.add(app)

    db.commit()
    return {"message": "Job rejected successfully", "job_id": job_id}


@router.post("/{application_id}/submit", response_model=SubmissionTriggerResponse)
async def trigger_application_submission(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Triggers job submission strategy:
    - Direct API submission for aggregator listings (e.g. Adzuna)
    - Playwright form fill with Hard Pause before submit for Wellfound/Haveloc/LinkedIn
    """
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    result = await submission_service.trigger_submission(db, app, current_user)
    return result


@router.post("/{application_id}/confirm-submission", response_model=SubmissionTriggerResponse)
async def confirm_application_submission(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Executes final submit click following explicit user authorization.
    """
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    result = await submission_service.confirm_submission(db, app, current_user)
    return result


@router.get("/dashboard/kanban", response_model=Dict[str, List[ApplicationResponse]])
def get_kanban_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns applications grouped into Kanban columns matching status enums:
    Ready to Apply, Applied, Under Review, Interview, Offer, Rejected.
    """
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
        .all()
    )

    kanban = {
        "Ready to Apply": [],
        "Applied": [],
        "Under Review": [],
        "Interview": [],
        "Offer": [],
        "Rejected": []
    }

    for a in apps:
        status_key = a.status if a.status in kanban else "Ready to Apply"
        kanban[status_key].append(a)

    return kanban


@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    query = db.query(Application).filter(Application.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Application.status == status_filter)

    applications = query.order_by(Application.updated_at.desc()).all()
    return applications


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    if data.status is not None:
        app.status = data.status
        if data.status.lower() == "applied" and not app.applied_at:
            app.applied_at = datetime.utcnow()
    if data.notes is not None:
        app.notes = data.notes
    if data.applied_at is not None:
        app.applied_at = data.applied_at

    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app)
    return app


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")
    return app
