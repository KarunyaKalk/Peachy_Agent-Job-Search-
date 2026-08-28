from pydantic import BaseModel
from typing import Dict, Any

class UserSettingsBase(BaseModel):
    scan_frequency_hours: int
    ats_threshold: int
    auto_revise_target_score: int
    daily_app_cap: int
    daily_email_cap: int
    platform_toggles: Dict[str, bool]
    dark_mode: bool

class UserSettingsResponse(UserSettingsBase):
    id: int
    class Config:
        from_attributes = True
