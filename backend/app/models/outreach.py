from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Outreach(Base):
    __tablename__ = "outreach"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    draft_id = Column(Integer, ForeignKey("cold_email_drafts.id"), nullable=True, index=True)

    recipient_name = Column(String, nullable=False)
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)

    status = Column(String, default="sent", index=True)  # sent, failed, capped
    error_message = Column(Text, nullable=True)

    sent_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", backref="outreach_logs")
    job = relationship("JobSeen", backref="outreach_logs")
    application = relationship("Application", backref="outreach_logs")
    draft = relationship("ColdEmailDraft", backref="outreach_logs")
