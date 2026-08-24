from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ColdEmailDraft(Base):
    __tablename__ = "cold_email_drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id"), nullable=False, index=True)

    contact_name = Column(String, nullable=False)
    contact_title = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    confidence_score = Column(Integer, default=90)

    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    
    status = Column(String, default="draft")  # draft, ready, sent
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="cold_email_drafts")
    job = relationship("JobSeen", backref="cold_email_drafts")
