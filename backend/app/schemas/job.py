from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class JobResponse(BaseModel):
    id: int
    user_id: int
    dedup_hash: str
    title: str
    company: str
    location: str
    jd_text: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    seniority: Optional[str] = None
    source_platform: str = "Adzuna"
    posted_date: Optional[str] = None
    apply_url: str
    relevance_score: int = 85
    is_saved: bool = False
    is_discarded: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class JobStatusUpdate(BaseModel):
    is_saved: Optional[bool] = None
    is_discarded: Optional[bool] = None


class JobSearchTriggerResponse(BaseModel):
    scanned_roles: List[str]
    total_found: int
    new_jobs_added: int
    deduplicated_count: int
    discarded_filtered: int
    jobs: List[JobResponse]
