from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.routers.profile import _get_or_create_profile
from app.models.user import User
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume
from app.schemas.tailored_resume import TailoredResumeResponse, TailoredResumeUpdate
from app.services.tailoring_service import ClaudeTailoringService

router = APIRouter(prefix="/tailor", tags=["tailoring"])
claude_tailoring_service = ClaudeTailoringService()


@router.post("/{job_id}", response_model=TailoredResumeResponse)
async def generate_tailored_resume_for_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    # 1. Fetch Job & Master Profile
    job = db.query(JobSeen).filter(JobSeen.id == job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    master_profile = _get_or_create_profile(db, current_user.id)

    # 2. Run Claude Tailoring & Fact-Guard Audit
    result = await claude_tailoring_service.generate_tailored_resume(master_profile, job)

    # 3. Check for existing versions
    existing = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )

    next_version = (existing.version_number + 1) if existing else 1

    # 4. Save Tailored Resume Version
    tailored_resume = TailoredResume(
        user_id=current_user.id,
        job_id=job_id,
        version_number=next_version,
        summary=result["summary"],
        tailored_json=result["tailored_json"],
        fact_guard_flags=result["fact_guard_flags"],
        status="draft",
    )

    db.add(tailored_resume)
    db.commit()
    db.refresh(tailored_resume)
    return tailored_resume


@router.get("/{job_id}", response_model=TailoredResumeResponse)
def get_tailored_resume(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    resume = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No tailored resume generated for this job yet.")
    return resume


@router.put("/{resume_id}", response_model=TailoredResumeResponse)
def update_tailored_resume(
    resume_id: int,
    data: TailoredResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    resume = db.query(TailoredResume).filter(TailoredResume.id == resume_id, TailoredResume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Tailored resume record not found")

    if data.summary is not None:
        resume.summary = data.summary
    if data.tailored_json is not None:
        resume.tailored_json = data.tailored_json
    if data.status is not None:
        resume.status = data.status

    db.commit()
    db.refresh(resume)
    return resume
