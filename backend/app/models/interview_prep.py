from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class InterviewPrepPack(Base):
    __tablename__ = "interview_prep_packs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs_seen.id"), nullable=False, index=True)

    company_name = Column(String, nullable=False)
    role_title = Column(String, nullable=False)
    company_overview = Column(Text, nullable=True)

    # JSON list: [{ id, question, topic, expected_answer, notes, is_completed }]
    technical_questions = Column(JSON, default=list)

    # JSON list: [{ id, question, competency, star_answer: { situation, task, action, result }, notes, is_completed }]
    behavioral_questions = Column(JSON, default=list)

    # JSON list of key skills to emphasize
    key_skills_to_highlight = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="interview_prep_packs")
    job = relationship("JobSeen", backref="interview_prep_packs")
