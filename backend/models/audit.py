from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from backend.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), index=True)  # e.g., "DISCOVERY_SCAN", "TAILOR_RESUME", "ATS_SCORE", "COLD_EMAIL_SENT"
    source = Column(String(100), default="System")  # e.g., "Celery Worker", "User UI", "Scraper"
    status = Column(String(50), default="SUCCESS")  # "SUCCESS", "WARNING", "ERROR", "BLOCKED"
    details = Column(Text, default="")
    metadata_json = Column(JSON, default=dict)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
