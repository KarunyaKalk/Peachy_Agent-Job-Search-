from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class STARAnswerSchema(BaseModel):
    situation: str
    task: str
    action: str
    result: str


class TechnicalPrepItemSchema(BaseModel):
    id: str
    question: str
    topic: str
    expected_answer: str
    notes: Optional[str] = ""
    is_completed: bool = False


class BehavioralPrepItemSchema(BaseModel):
    id: str
    question: str
    competency: str
    star_answer: STARAnswerSchema
    notes: Optional[str] = ""
    is_completed: bool = False


class InterviewPrepPackResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    company_name: str
    role_title: str
    company_overview: Optional[str] = None
    technical_questions: List[TechnicalPrepItemSchema] = []
    behavioral_questions: List[BehavioralPrepItemSchema] = []
    key_skills_to_highlight: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PrepItemUpdateRequest(BaseModel):
    item_id: str
    item_type: str  # "technical" | "behavioral"
    is_completed: Optional[bool] = None
    notes: Optional[str] = None
