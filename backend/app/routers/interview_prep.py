from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.routers.profile import _get_or_create_profile
from app.models.user import User
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume
from app.models.interview_prep import InterviewPrepPack
from app.schemas.interview_prep import (
    InterviewPrepPackResponse,
    PrepItemUpdateRequest,
)
from app.services.interview_prep_service import InterviewPrepService

router = APIRouter(prefix="/interview-prep", tags=["interview-prep"])
prep_service = InterviewPrepService()


@router.post("/generate/{job_id}", response_model=InterviewPrepPackResponse)
async def generate_interview_prep_pack(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Generates a company-specific, STAR-formatted Interview Prep Pack
    combining target JD, candidate accomplishments, technical questions, and behavioral stories.
    """
    job = db.query(JobSeen).filter(JobSeen.id == job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    master_profile = _get_or_create_profile(db, current_user.id)
    tailored_resume = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )

    result = await prep_service.generate_prep_pack(master_profile, job, tailored_resume)

    # Check for existing prep pack for this job
    existing = (
        db.query(InterviewPrepPack)
        .filter(InterviewPrepPack.job_id == job_id, InterviewPrepPack.user_id == current_user.id)
        .first()
    )

    if existing:
        existing.company_name = job.company
        existing.role_title = job.title
        existing.company_overview = result["company_overview"]
        existing.key_skills_to_highlight = result["key_skills_to_highlight"]
        existing.technical_questions = result["technical_questions"]
        existing.behavioral_questions = result["behavioral_questions"]
        db.commit()
        db.refresh(existing)
        return existing

    prep_pack = InterviewPrepPack(
        user_id=current_user.id,
        job_id=job_id,
        company_name=job.company,
        role_title=job.title,
        company_overview=result["company_overview"],
        key_skills_to_highlight=result["key_skills_to_highlight"],
        technical_questions=result["technical_questions"],
        behavioral_questions=result["behavioral_questions"],
    )

    db.add(prep_pack)
    db.commit()
    db.refresh(prep_pack)
    return prep_pack


@router.get("/job/{job_id}", response_model=InterviewPrepPackResponse)
def get_prep_pack_by_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    prep_pack = (
        db.query(InterviewPrepPack)
        .filter(InterviewPrepPack.job_id == job_id, InterviewPrepPack.user_id == current_user.id)
        .first()
    )
    if not prep_pack:
        raise HTTPException(status_code=404, detail="No interview prep pack generated for this job yet.")
    return prep_pack


@router.get("/all", response_model=List[InterviewPrepPackResponse])
def get_all_interview_prep_packs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    packs = (
        db.query(InterviewPrepPack)
        .filter(InterviewPrepPack.user_id == current_user.id)
        .order_by(InterviewPrepPack.updated_at.desc())
        .all()
    )
    return packs


@router.put("/{pack_id}/item", response_model=InterviewPrepPackResponse)
def update_prep_item_status(
    pack_id: int,
    data: PrepItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    pack = (
        db.query(InterviewPrepPack)
        .filter(InterviewPrepPack.id == pack_id, InterviewPrepPack.user_id == current_user.id)
        .first()
    )
    if not pack:
        raise HTTPException(status_code=404, detail="Interview prep pack record not found")

    items = pack.technical_questions if data.item_type == "technical" else pack.behavioral_questions
    updated_items = []
    found = False

    for item in items:
        if item.get("id") == data.item_id:
            found = True
            if data.is_completed is not None:
                item["is_completed"] = data.is_completed
            if data.notes is not None:
                item["notes"] = data.notes
        updated_items.append(item)

    if not found:
        raise HTTPException(status_code=404, detail=f"Item with ID '{data.item_id}' not found in prep pack")

    if data.item_type == "technical":
        pack.technical_questions = updated_items
    else:
        pack.behavioral_questions = updated_items

    # Force SQLAlchemy change detection for JSON field
    db.flag_modified(pack, "technical_questions" if data.item_type == "technical" else "behavioral_questions")
    db.commit()
    db.refresh(pack)
    return pack
