from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.schemas.job import JobResponse
from app.schemas.tailored_resume import TailoredResumeResponse


class ATSBreakdown(BaseModel):
    keyword_alignment_score: int = 92
    fact_guard_verified_claims: int = 4
    fact_guard_flagged_claims: int = 0
    skills_coverage_score: int = 95


class ReviewQueueItemResponse(BaseModel):
    job: JobResponse
    tailored_resume: TailoredResumeResponse
    ats_breakdown: ATSBreakdown
    status: str = "pending_review"  # pending_review, approved, rejected


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    resume_version: Optional[int] = 1
    status: Optional[str] = "Ready to Apply"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int] = None
    resume_version: int = 1
    status: str = "Ready to Apply"
    notes: Optional[str] = None
    submission_type: Optional[str] = None
    prefill_screenshot: Optional[str] = None
    attempt_log: List[Dict[str, Any]] = []
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    job: Optional[JobResponse] = None
    resume: Optional[TailoredResumeResponse] = None

    class Config:
        from_attributes = True


class SubmissionTriggerResponse(BaseModel):
    status: str  # "applied" | "pending_confirmation" | "failed"
    submission_type: str  # "direct_api" | "form_fill"
    prefill_screenshot: Optional[str] = None
    message: str
    application: ApplicationResponse
