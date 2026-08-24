from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("tailored_resumes.id"), nullable=True, index=True)
    
    resume_version = Column(Integer, default=1)
    
    # Status options: "Not Applied", "Ready to Apply", "Applied", "Under Review", "Interview", "Rejected", "Offer"
    status = Column(String, default="Ready to Apply", index=True)
    notes = Column(Text, nullable=True)
    
    # Submission logging
    submission_type = Column(String, nullable=True)  # "direct_api" | "form_fill"
    prefill_screenshot = Column(Text, nullable=True)  # base64 screenshot of pre-filled form
    attempt_log = Column(JSON, default=list)  # list of attempt records: [{ timestamp, status, message }]
    
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="applications")
    job = relationship("JobSeen", backref="applications")
    resume = relationship("TailoredResume", backref="applications")
