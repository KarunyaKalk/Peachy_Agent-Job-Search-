from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.job import JobResponse


class HiringContactSchema(BaseModel):
    name: str
    title: str
    email: Optional[str] = None
    confidence_score: int = 90
    domain: Optional[str] = None
    source: str = "Hunter.io Domain Search"


class ColdEmailGenerateRequest(BaseModel):
    job_id: int
    contact_name: str
    contact_title: Optional[str] = "Hiring Manager"
    contact_email: Optional[str] = None
    confidence_score: Optional[int] = 90


class ColdEmailDraftUpdate(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    status: Optional[str] = None  # draft, ready, sent


class ColdEmailDraftResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    contact_name: str
    contact_title: Optional[str] = None
    contact_email: Optional[str] = None
    confidence_score: int = 90
    subject: str
    body: str
    status: str = "draft"
    created_at: datetime
    updated_at: datetime

    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True


class DailyQuotaResponse(BaseModel):
    sent_today: int
    daily_cap: int = 15
    remaining: int


class OutreachLogResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    application_id: Optional[int] = None
    draft_id: Optional[int] = None

    recipient_name: str
    recipient_email: str
    subject: str
    body: str
    status: str = "sent"
    error_message: Optional[str] = None
    sent_at: datetime

    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True
