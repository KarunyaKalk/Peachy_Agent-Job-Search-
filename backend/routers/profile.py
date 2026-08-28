from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from backend.database import get_db
from backend.models.profile import MasterProfile, JobPreference
from backend.schemas.profile import MasterProfileBase, MasterProfileResponse, JobPreferenceBase, JobPreferenceResponse
from backend.services.resume_parser import parse_file_to_text
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=MasterProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = result.scalars().first()
    if not profile:
        profile = MasterProfile()
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile

@router.put("", response_model=MasterProfileResponse)
async def update_profile(profile_data: MasterProfileBase, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = result.scalars().first()
    if not profile:
        profile = MasterProfile()
        db.add(profile)
        
    profile.full_name = profile_data.full_name
    profile.email = profile_data.email
    profile.phone = profile_data.phone
    profile.location = profile_data.location
    profile.linkedin_url = profile_data.linkedin_url
    profile.github_url = profile_data.github_url
    profile.portfolio_url = profile_data.portfolio_url
    profile.summary = profile_data.summary
    profile.skills_json = profile_data.skills_json
    profile.experience_json = profile_data.experience_json
    profile.projects_json = profile_data.projects_json
    profile.education_json = profile_data.education_json
    profile.certifications_json = profile_data.certifications_json
    profile.keyword_fingerprint = profile_data.keyword_fingerprint or profile.keyword_fingerprint
    
    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/autofill")
async def autofill_profile_upload(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Module 1: Upload Resume to Auto-Fill endpoint.
    Accepts PDF/DOCX, parses via Gemini API into structured schema,
    and returns a review object (extracted vs current) for the UI review modal.
    """
    contents = await file.read()
    raw_text = parse_file_to_text(contents, file.filename)
    
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from uploaded file.")
        
    extracted_schema = await gemini_service.parse_resume_to_schema(raw_text)
    
    # Fetch current profile to present side-by-side review
    result = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = result.scalars().first()
    
    current_data = {
        "full_name": profile.full_name if profile else "",
        "email": profile.email if profile else "",
        "phone": profile.phone if profile else "",
        "location": profile.location if profile else "",
        "linkedin_url": profile.linkedin_url if profile else "",
        "github_url": profile.github_url if profile else "",
        "portfolio_url": profile.portfolio_url if profile else "",
        "summary": profile.summary if profile else "",
        "skills_json": profile.skills_json if profile else {},
        "experience_json": profile.experience_json if profile else [],
        "projects_json": profile.projects_json if profile else [],
        "education_json": profile.education_json if profile else [],
        "certifications_json": profile.certifications_json if profile else [],
        "keyword_fingerprint": profile.keyword_fingerprint if profile else []
    }
    
    return {
        "status": "REVIEW_REQUIRED",
        "extracted": extracted_schema,
        "current": current_data
    }

@router.get("/preferences", response_model=JobPreferenceResponse)
async def get_preferences(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobPreference).order_by(JobPreference.id.asc()))
    pref = result.scalars().first()
    if not pref:
        pref = JobPreference()
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref

@router.put("/preferences", response_model=JobPreferenceResponse)
async def update_preferences(pref_data: JobPreferenceBase, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobPreference).order_by(JobPreference.id.asc()))
    pref = result.scalars().first()
    if not pref:
        pref = JobPreference()
        db.add(pref)
        
    pref.target_roles = pref_data.target_roles
    pref.seniority = pref_data.seniority
    pref.location_types = pref_data.location_types
    pref.preferred_cities = pref_data.preferred_cities
    pref.salary_floor = pref_data.salary_floor
    pref.industries_include = pref_data.industries_include
    pref.industries_exclude = pref_data.industries_exclude
    pref.company_sizes = pref_data.company_sizes
    pref.exclude_keywords = pref_data.exclude_keywords
    
    await db.commit()
    await db.refresh(pref)
    return pref
