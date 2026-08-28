from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    action: str
    source: str
    status: str
    details: str
    metadata_json: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True
