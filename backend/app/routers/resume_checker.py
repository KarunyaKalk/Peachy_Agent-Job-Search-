from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.routers.profile import _get_or_create_profile
from app.models.user import User
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume
from app.schemas.resume_checker import (
    ResumeCheckerRequest,
    ResumeCheckerResponse,
    SaveFingerprintRequest,
)
from app.services.resume_checker_service import ResumeCheckerService

router = APIRouter(prefix="/resume-checker", tags=["resume-checker"])
checker_service = ResumeCheckerService()


@router.post("/analyze", response_model=ResumeCheckerResponse)
async def analyze_resume_against_jd(
    data: ResumeCheckerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Performs standalone contextual keyword extraction (skills, tools, leadership)
    and quick ATS scoring against any arbitrary resume text and job description.
    """
    master_profile = _get_or_create_profile(db, current_user.id)

    # 1. Resolve Resume Text
    resume_text = data.resume_text or ""
    if not resume_text:
        if data.resume_source == "master_profile":
            bullets = []
            for exp in (master_profile.experiences or []):
                for b in (exp.bullets or []):
                    bullets.append(b.content)
            skills = [s.name for s in (master_profile.skills or [])]
            resume_text = (
                f"Summary: {master_profile.summary or ''}\n"
                f"Skills: {', '.join(skills)}\n"
                f"Experience:\n" + "\n".join(bullets)
            )
        else:
            resume_text = "Senior Full Stack Engineer proficient in Python, TypeScript, React, FastAPI, PostgreSQL, Docker, Redis, and cloud architecture."

    # 2. Resolve JD Text
    jd_text = data.jd_text or ""
    if not jd_text and data.job_id:
        job = db.query(JobSeen).filter(JobSeen.id == data.job_id, JobSeen.user_id == current_user.id).first()
        if job:
            jd_text = f"Title: {job.title} @ {job.company}\nDescription:\n{job.jd_text}"

    if not jd_text:
        jd_text = "Looking for a Senior Full Stack Engineer with expertise in Python, FastAPI, React, TypeScript, PostgreSQL, Docker, and distributed microservices."

    result = await checker_service.analyze_resume_against_jd(
        resume_text=resume_text,
        jd_text=jd_text,
        master_profile=master_profile,
    )

    return result


@router.post("/save-fingerprint")
def save_keyword_fingerprint(
    data: SaveFingerprintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Persists extracted resume keywords back to Master Profile as a keyword fingerprint
    to improve multi-source job match scoring going forward.
    """
    master_profile = _get_or_create_profile(db, current_user.id)
    
    current_fps = set(master_profile.keyword_fingerprint or [])
    new_fps = current_fps.union(set(data.keywords))
    
    master_profile.keyword_fingerprint = list(new_fps)
    db.commit()
    db.refresh(master_profile)

    return {
        "message": f"Successfully updated Master Profile keyword fingerprint with {len(new_fps)} unique skills.",
        "keyword_fingerprint": master_profile.keyword_fingerprint,
    }
