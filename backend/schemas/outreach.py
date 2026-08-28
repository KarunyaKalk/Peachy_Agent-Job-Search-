from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class FindContactRequest(BaseModel):
    company: str
    domain: Optional[str] = None
    job_id: Optional[int] = None

class GenerateColdEmailRequest(BaseModel):
    job_id: int
    recipient_name: str
    recipient_title: str
    recipient_email: str

class SendColdEmailRequest(BaseModel):
    job_id: Optional[int] = None
    recipient_email: str
    recipient_name: str
    recipient_title: str
    subject: str
    body: str

class SendTestEmailRequest(BaseModel):
    target_email: str

class OutreachLogResponse(BaseModel):
    id: int
    job_id: Optional[int] = None
    recipient_email: str
    recipient_name: str
    recipient_title: str
    subject: str
    body: str
    status: str
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
