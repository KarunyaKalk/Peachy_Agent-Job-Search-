from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.job import Job
from backend.models.profile import MasterProfile
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/interview", tags=["Interview Prep Assistant"])

@router.get("/prep/{job_id}")
async def get_interview_prep(job_id: int, db: AsyncSession = Depends(get_db)):
    """Module 7: Generate interview prep kit with STAR format answers and technical/behavioral questions."""
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")

    prof_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = prof_res.scalars().first()
    
    master_dict = {
        "full_name": profile.full_name if profile else "Karunya",
        "summary": profile.summary if profile else "",
        "experience_json": profile.experience_json if profile else []
    }

    prep_pack = await gemini_service.generate_interview_prep(master_dict, job.full_jd_text)
    prep_pack["job_title"] = job.title
    prep_pack["company"] = job.company

    return prep_pack
