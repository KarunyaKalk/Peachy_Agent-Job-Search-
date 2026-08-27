from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    category: str
    action: str
    details: Optional[str] = None
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    category: str
    action: str
    details: Optional[str] = None
    status: Optional[str] = "success"
