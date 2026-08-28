from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from datetime import datetime
from backend.database import Base

class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id", ondelete="CASCADE"), nullable=True)
    
    recipient_email = Column(String(255), nullable=False)
    recipient_name = Column(String(255), default="Hiring Team")
    recipient_title = Column(String(255), default="Recruiter / Technical Manager")
    
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    
    # Status: 'Draft', 'Sent', 'Failed', 'Test Email Sent'
    status = Column(String(50), default="Draft")
    error_message = Column(Text, nullable=True)
    
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
