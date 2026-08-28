from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Float, Boolean
from datetime import datetime
from backend.database import Base

class Job(Base):
    __tablename__ = "jobs_seen"

    id = Column(Integer, primary_key=True, index=True)
    dedup_hash = Column(String(255), unique=True, index=True)
    title = Column(String(255), index=True)
    company = Column(String(255), index=True)
    location = Column(String(255))
    salary_range = Column(String(255), nullable=True)
    seniority = Column(String(100), nullable=True)
    job_type = Column(String(100), default="Remote")  # Remote / Hybrid / Onsite
    full_jd_text = Column(Text)
    source_platform = Column(String(100))  # Adzuna, JSearch, Wellfound, Haveloc, LinkedIn-Manual
    apply_url = Column(String(1000))
    posted_date = Column(String(100), nullable=True)
    
    match_score = Column(Float, default=0.0)  # 0 to 100
    is_hidden = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
