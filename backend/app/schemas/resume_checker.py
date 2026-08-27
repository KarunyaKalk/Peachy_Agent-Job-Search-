from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ResumeCheckerRequest(BaseModel):
    resume_text: Optional[str] = None
    resume_source: Optional[str] = "master_profile"  # "master_profile" | "uploaded_text" | "tailored_resume"
    jd_text: Optional[str] = None
    jd_url: Optional[str] = None
    job_id: Optional[int] = None


class ExtractedCategorySchema(BaseModel):
    technical_skills: List[str] = []
    tools: List[str] = []
    soft_skills: List[str] = []
    certifications: List[str] = []
    role_titles: List[str] = []


class ResumeCheckerResponse(BaseModel):
    overall_ats_score: int
    keyword_match_score: int
    formatting_score: int
    completeness_score: int
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    resume_keywords: ExtractedCategorySchema = ExtractedCategorySchema()
    jd_keywords: ExtractedCategorySchema = ExtractedCategorySchema()
    recommendations: List[str] = []
    resume_preview_text: Optional[str] = None
    jd_preview_text: Optional[str] = None


class SaveFingerprintRequest(BaseModel):
    keywords: List[str] = []
