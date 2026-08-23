from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class TailoredResume(Base):
    __tablename__ = "tailored_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id"), nullable=False, index=True)
    
    version_number = Column(Integer, default=1)
    summary = Column(Text, nullable=True)
    
    # Structured JSON: contact_info, summary, skills, experiences, projects, education
    tailored_json = Column(JSON, nullable=False)
    
    # List of Fact-Guard flags: [{ field, claim, status: "verified"|"flagged", reason }]
    fact_guard_flags = Column(JSON, default=list)
    
    status = Column(String, default="draft")  # draft, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="tailored_resumes")
    job = relationship("JobSeen", backref="tailored_resumes")
