from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class FactGuardFlag(BaseModel):
    field: str
    claim: str
    status: str  # "verified" | "flagged"
    reason: str


class TailoredResumeResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    version_number: int = 1
    summary: Optional[str] = None
    tailored_json: Dict[str, Any]
    fact_guard_flags: List[FactGuardFlag] = []
    status: str = "draft"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TailoredResumeUpdate(BaseModel):
    summary: Optional[str] = None
    tailored_json: Optional[Dict[str, Any]] = None
    status: Optional[str] = None  # "draft" | "approved" | "rejected"
