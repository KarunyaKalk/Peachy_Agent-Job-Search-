from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Category: 'scrape_run' | 'resume_generation' | 'ats_score' | 'application_submitted' | 'email_sent' | 'captcha_blocked'
    category = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)

    # Status: 'success' | 'warning' | 'error' | 'captcha_blocked'
    status = Column(String, default="success", index=True)

    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", backref="audit_logs")
