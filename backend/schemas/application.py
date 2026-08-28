from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationUpdateStatus(BaseModel):
    status: str  # 'Not Applied', 'Ready to Apply', 'Applied', 'Under Review', 'Interview', 'Rejected', 'Offer'
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    resume_id: Optional[int] = None
    status: str
    submission_type: str
    notes: Optional[str] = ""
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Extended response fields for UI view
    job_title: Optional[str] = None
    company: Optional[str] = None
    match_score: Optional[float] = 0.0

    class Config:
        from_attributes = True
