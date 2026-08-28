from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Float, Boolean, ForeignKey
from datetime import datetime
from backend.database import Base

class TailoredResume(Base):
    __tablename__ = "tailored_resumes"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id", ondelete="CASCADE"), nullable=True)
    version_number = Column(Integer, default=1)
    
    tailored_text = Column(Text)
    structured_data = Column(JSON, default=dict)
    pdf_filename = Column(String(255), nullable=True)
    
    ats_score = Column(Float, default=0.0)
    ats_breakdown = Column(JSON, default=dict)  # {"keyword_match": 85, "formatting": 95, "completeness": 90, "missing_keywords": ["Kubernetes", "GraphQL"]}
    
    fact_check_passed = Column(Boolean, default=True)
    fact_check_flags = Column(JSON, default=list)  # List of untraceable or altered bullet claims flagged for review
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
