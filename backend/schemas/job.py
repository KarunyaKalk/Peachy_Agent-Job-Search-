from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    salary_range: Optional[str] = None
    seniority: Optional[str] = None
    job_type: Optional[str] = "Remote"
    full_jd_text: str
    source_platform: str
    apply_url: str
    posted_date: Optional[str] = None

class JobCreate(JobBase):
    dedup_hash: Optional[str] = None
    match_score: Optional[float] = 0.0

class JobResponse(JobBase):
    id: int
    dedup_hash: str
    match_score: float
    is_hidden: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LinkedInParseRequest(BaseModel):
    url: str
