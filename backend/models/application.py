from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("tailored_resumes.id", ondelete="SET NULL"), nullable=True)
    
    # Status Enum: 'Not Applied', 'Ready to Apply', 'Applied', 'Under Review', 'Interview', 'Rejected', 'Offer'
    status = Column(String(50), default="Not Applied", index=True)
    submission_type = Column(String(50), default="Direct API / Playwright Pause")
    notes = Column(Text, default="")
    
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
