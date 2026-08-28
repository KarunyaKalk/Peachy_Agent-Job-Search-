from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Dict, Any

from backend.database import get_db
from backend.models.resume import TailoredResume
from backend.models.profile import MasterProfile
from backend.models.job import Job
from backend.schemas.resume import TailorResumeRequest, StandaloneCheckerRequest, TailoredResumeResponse, ATSCheckResult
from backend.services.gemini_service import gemini_service
from backend.services.ats_checker import ats_checker
from backend.services.pdf_generator import generate_ats_pdf
from backend.services.fact_guard import fact_guard
from backend.services.resume_parser import parse_file_to_text

router = APIRouter(prefix="/api/resumes", tags=["Resume Tailoring & ATS Checker"])

@router.post("/tailor", response_model=TailoredResumeResponse)
async def tailor_resume_for_job(req: TailorResumeRequest, db: AsyncSession = Depends(get_db)):
    """
    Module 3: Tailor master resume for job description with Fact-Guard verification pass.
    Includes auto-revision loop if score < 89.
    """
    # Fetch job description
    j_res = await db.execute(select(Job).where(Job.id == req.job_id))
    job = j_res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # Fetch master profile
    p_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = p_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="Master profile empty. Please fill profile first.")

    master_dict = {
        "full_name": profile.full_name,
        "email": profile.email,
        "phone": profile.phone,
        "location": profile.location,
        "linkedin_url": profile.linkedin_url,
        "portfolio_url": profile.portfolio_url,
        "summary": profile.summary,
        "skills_json": profile.skills_json or {},
        "experience_json": profile.experience_json or [],
        "education_json": profile.education_json or [],
        "certifications_json": profile.certifications_json or []
    }

    # Execute auto-revision tailoring loop (target ATS score 89)
    tailored_profile, score_data, iterations = await ats_checker.auto_revise_loop(master_dict, job.full_jd_text, target_score=89)

    # Fact-Guard Verification Pass
    fact_check_result = fact_guard.verify_tailored_resume(master_dict, tailored_profile)

    # Generate ATS PDF
    pdf_filename = f"Resume_Job_{job.id}_v1.pdf"
    pdf_path = generate_ats_pdf(tailored_profile, pdf_filename)

    # Construct plain text version
    bullets = " ".join([b for exp in tailored_profile.get("experience_json", []) for b in exp.get("bullets", [])])
    tailored_text = f"{tailored_profile.get('summary', '')}\n\n{bullets}"

    # Save to database
    resume_record = TailoredResume(
        job_id=job.id,
        version_number=1,
        tailored_text=tailored_text,
        structured_data=tailored_profile,
        pdf_filename=pdf_filename,
        ats_score=score_data["overall_score"],
        ats_breakdown=score_data,
        fact_check_passed=fact_check_result["passed"],
        fact_check_flags=fact_check_result["flags"]
    )
    db.add(resume_record)
    await db.commit()
    await db.refresh(resume_record)

    return resume_record

@router.post("/standalone-checker", response_model=ATSCheckResult)
async def standalone_ats_checker(
    file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(""),
    tracked_job_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Module 4: Standalone ATS Resume Checker tool.
    Accepts resume upload/profile selection + JD text/tracked job ID -> extracts keywords -> returns ATS score breakdown & 2-column keywords -> saves extracted keywords to profile fingerprint.
    """
    resume_text = ""
    pdf_bytes = None

    if file:
        pdf_bytes = await file.read()
        resume_text = parse_file_to_text(pdf_bytes, file.filename)
    else:
        # Fallback to master profile text
        p_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
        profile = p_res.scalars().first()
        if profile:
            resume_text = f"{profile.summary} " + " ".join([b for exp in profile.experience_json or [] for b in exp.get("bullets", [])])

    target_jd = jd_text or ""
    if tracked_job_id and not target_jd:
        j_res = await db.execute(select(Job).where(Job.id == tracked_job_id))
        job = j_res.scalars().first()
        if job:
            target_jd = job.full_jd_text

    if not target_jd:
        target_jd = "Senior Full Stack Software Engineer role with Python, FastAPI, React, TypeScript, PostgreSQL, Docker, and REST APIs."

    score_result = await ats_checker.calculate_ats_score(resume_text, target_jd, pdf_bytes)

    # Persist extracted keywords back to Master Profile fingerprint
    p_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = p_res.scalars().first()
    if profile:
        existing_fp = set(profile.keyword_fingerprint or [])
        existing_fp.update(score_result["matched_keywords"])
        profile.keyword_fingerprint = list(existing_fp)
        await db.commit()

    return ATSCheckResult(
        overall_score=score_result["overall_score"],
        breakdown=score_result["breakdown"],
        matched_keywords=score_result["matched_keywords"],
        missing_keywords=score_result["missing_keywords"],
        formatting_issues=score_result["formatting_issues"],
        structure_issues=score_result["structure_issues"]
    )

@router.get("/{resume_id}/pdf")
async def download_tailored_pdf(resume_id: int, db: AsyncSession = Depends(get_db)):
    """Download generated ATS PDF file."""
    res = await db.execute(select(TailoredResume).where(TailoredResume.id == resume_id))
    resume = res.scalars().first()
    if not resume or not resume.pdf_filename:
        raise HTTPException(status_code=404, detail="Tailored PDF file not found.")

    pdf_path = f"generated_pdfs/{resume.pdf_filename}"
    return FileResponse(pdf_path, media_type="application/pdf", filename=resume.pdf_filename)
