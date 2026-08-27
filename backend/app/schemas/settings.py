from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SystemSettingsResponse(BaseModel):
    id: int
    user_id: int
    scan_frequency_hours: int
    ats_score_threshold: int
    daily_application_cap: int
    daily_cold_email_cap: int
    adzuna_enabled: bool
    wellfound_enabled: bool
    haveloc_enabled: bool
    linkedin_enabled: bool
    telegram_webhook_url: Optional[str] = None
    email_webhook_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemSettingsUpdate(BaseModel):
    scan_frequency_hours: Optional[int] = Field(None, ge=1, le=48)
    ats_score_threshold: Optional[int] = Field(None, ge=0, le=100)
    daily_application_cap: Optional[int] = Field(None, ge=1, le=100)
    daily_cold_email_cap: Optional[int] = Field(None, ge=1, le=100)
    adzuna_enabled: Optional[bool] = None
    wellfound_enabled: Optional[bool] = None
    haveloc_enabled: Optional[bool] = None
    linkedin_enabled: Optional[bool] = None
    telegram_webhook_url: Optional[str] = None
    email_webhook_url: Optional[str] = None
