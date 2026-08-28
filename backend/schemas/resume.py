from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class TailorResumeRequest(BaseModel):
    job_id: int
    custom_instructions: Optional[str] = ""

class StandaloneCheckerRequest(BaseModel):
    resume_id: Optional[int] = None
    jd_text: Optional[str] = ""
    jd_url: Optional[str] = ""
    tracked_job_id: Optional[int] = None

class ATSCheckResult(BaseModel):
    overall_score: float
    breakdown: Dict[str, Any]
    matched_keywords: List[str]
    missing_keywords: List[str]
    formatting_issues: List[str]
    structure_issues: List[str]

class TailoredResumeResponse(BaseModel):
    id: int
    job_id: Optional[int] = None
    version_number: int
    tailored_text: str
    structured_data: Dict[str, Any]
    pdf_filename: Optional[str] = None
    ats_score: float
    ats_breakdown: Dict[str, Any]
    fact_check_passed: bool
    fact_check_flags: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True
