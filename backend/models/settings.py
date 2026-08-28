from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime
from datetime import datetime
from backend.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    scan_frequency_hours = Column(Integer, default=6)
    ats_threshold = Column(Integer, default=60)
    auto_revise_target_score = Column(Integer, default=89)
    daily_app_cap = Column(Integer, default=10)
    daily_email_cap = Column(Integer, default=15)
    
    # Active toggles for platforms: {"adzuna": true, "wellfound": true, "haveloc": true, "linkedin_manual": true}
    platform_toggles = Column(JSON, default=lambda: {
        "adzuna": True, 
        "wellfound": True, 
        "haveloc": True, 
        "linkedin_manual": True
    })
    
    dark_mode = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
