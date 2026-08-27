from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.profile import (
    ContactSummaryUpdate,
    SkillCreate,
    WorkExperienceCreate,
    ProjectCreate,
    EducationCreate,
    CertificationCreate,
    MasterProfileResponse,
)


class ParsedContactSummary(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None


class AmbiguityFlag(BaseModel):
    id: str
    section: str  # 'contact', 'experience', 'skills', 'projects', 'education', 'certifications'
    item_identifier: Optional[str] = None  # e.g., "Software Engineer at Google"
    field: str  # e.g., "start_date" or "bullets"
    reason: str  # Explanation of why it's ambiguous
    suggested_action: str  # What user should check


class ParsedResumeData(BaseModel):
    contact: ParsedContactSummary = ParsedContactSummary()
    summary: Optional[str] = None
    skills: List[SkillCreate] = []
    experiences: List[WorkExperienceCreate] = []
    projects: List[ProjectCreate] = []
    education: List[EducationCreate] = []
    certifications: List[CertificationCreate] = []


class ResumeParseResponse(BaseModel):
    extracted_data: ParsedResumeData
    current_profile: MasterProfileResponse
    ambiguities: List[AmbiguityFlag] = []
    raw_text_snippet: Optional[str] = None


class ApplyParsedResumeRequest(BaseModel):
    contact_summary: Optional[ContactSummaryUpdate] = None
    skills: Optional[List[SkillCreate]] = None
    experiences: Optional[List[WorkExperienceCreate]] = None
    projects: Optional[List[ProjectCreate]] = None
    education: Optional[List[EducationCreate]] = None
    certifications: Optional[List[CertificationCreate]] = None
