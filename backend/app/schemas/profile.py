from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


# --- Contact & Summary ---
class ContactSummaryUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None


# --- Skill ---
class SkillBase(BaseModel):
    category: str = "General"
    name: str
    proficiency: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Bullet Variant ---
class BulletVariantBase(BaseModel):
    variant_text: str
    tag: Optional[str] = "Alternate Phrasing"


class BulletVariantCreate(BulletVariantBase):
    pass


class BulletVariantResponse(BulletVariantBase):
    id: int
    bullet_id: int

    class Config:
        from_attributes = True


# --- Experience Bullet ---
class ExperienceBulletBase(BaseModel):
    content: str
    impact_category: Optional[str] = None
    display_order: int = 0


class ExperienceBulletCreate(ExperienceBulletBase):
    pass


class ExperienceBulletResponse(ExperienceBulletBase):
    id: int
    experience_id: int
    variants: List[BulletVariantResponse] = []

    class Config:
        from_attributes = True


# --- Work Experience ---
class WorkExperienceBase(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    display_order: int = 0


class WorkExperienceCreate(WorkExperienceBase):
    bullets: Optional[List[ExperienceBulletCreate]] = []


class WorkExperienceResponse(WorkExperienceBase):
    id: int
    profile_id: int
    bullets: List[ExperienceBulletResponse] = []

    class Config:
        from_attributes = True


# --- Project ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Education ---
class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa_or_honors: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Certification ---
class CertificationBase(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationCreate(CertificationBase):
    pass


class CertificationResponse(CertificationBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Job Preferences ---
class JobPreferencesUpdate(BaseModel):
    target_roles: List[str] = []
    seniority_levels: List[str] = []
    job_types: List[str] = []
    work_modes: List[str] = []
    preferred_locations: List[str] = []
    salary_floor: int = 120000
    salary_currency: str = "USD"
    included_industries: List[str] = []
    excluded_industries: List[str] = []
    company_sizes: List[str] = []
    excluded_keywords: List[str] = []


class JobPreferencesResponse(JobPreferencesUpdate):
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Master Profile ---
class MasterProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None

    skills: List[SkillResponse] = []
    experiences: List[WorkExperienceResponse] = []
    projects: List[ProjectResponse] = []
    education: List[EducationResponse] = []
    certifications: List[CertificationResponse] = []
    preferences: Optional[JobPreferencesResponse] = None

    class Config:
        from_attributes = True
