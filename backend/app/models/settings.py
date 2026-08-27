from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Core Parameters
    scan_frequency_hours = Column(Integer, default=6)
    ats_score_threshold = Column(Integer, default=80)
    daily_application_cap = Column(Integer, default=20)
    daily_cold_email_cap = Column(Integer, default=15)

    # Platform Active/Inactive Toggles
    adzuna_enabled = Column(Boolean, default=True)
    wellfound_enabled = Column(Boolean, default=True)
    haveloc_enabled = Column(Boolean, default=True)
    linkedin_enabled = Column(Boolean, default=True)

    # CAPTCHA & Block Alert Webhooks
    telegram_webhook_url = Column(String, nullable=True)
    email_webhook_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="settings")
