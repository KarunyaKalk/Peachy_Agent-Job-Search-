from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

class MasterProfileBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    summary: str
    skills_json: Dict[str, List[str]]
    experience_json: List[Dict[str, Any]]
    projects_json: List[Dict[str, Any]]
    education_json: List[Dict[str, Any]]
    certifications_json: List[str]
    keyword_fingerprint: Optional[List[str]] = []

class MasterProfileCreate(MasterProfileBase):
    pass

class MasterProfileResponse(MasterProfileBase):
    id: int
    class Config:
        from_attributes = True

class JobPreferenceBase(BaseModel):
    target_roles: List[str]
    seniority: List[str]
    location_types: List[str]
    preferred_cities: List[str]
    salary_floor: int
    industries_include: List[str]
    industries_exclude: List[str]
    company_sizes: List[str]
    exclude_keywords: List[str]

class JobPreferenceResponse(JobPreferenceBase):
    id: int
    class Config:
        from_attributes = True

class ProfileAutoFillReview(BaseModel):
    extracted: MasterProfileBase
    current: MasterProfileBase
