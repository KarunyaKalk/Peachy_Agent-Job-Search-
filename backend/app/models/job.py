import hashlib
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class JobSeen(Base):
    __tablename__ = "jobs_seen"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Hash for deduplication (MD5 of apply_url or title+company)
    dedup_hash = Column(String, unique=True, index=True, nullable=False)
    
    # Core Job Details
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    jd_text = Column(Text, nullable=False)
    
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String, default="USD")
    
    seniority = Column(String, nullable=True)
    source_platform = Column(String, default="Adzuna")
    posted_date = Column(String, nullable=True)
    apply_url = Column(Text, nullable=False)
    
    # Matching & Status
    relevance_score = Column(Integer, default=85)
    is_saved = Column(Boolean, default=False)
    is_discarded = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="jobs")

    @staticmethod
    def generate_hash(apply_url: str, title: str, company: str) -> str:
        unique_str = (apply_url or f"{title}-{company}").strip().lower()
        return hashlib.md5(unique_str.encode("utf-8")).hexdigest()
