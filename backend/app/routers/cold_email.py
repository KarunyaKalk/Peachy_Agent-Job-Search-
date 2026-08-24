from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.routers.profile import _get_or_create_profile
from app.models.user import User
from app.models.job import JobSeen
from app.models.tailored_resume import TailoredResume
from app.models.cold_email import ColdEmailDraft
from app.models.outreach import Outreach
from app.schemas.cold_email import (
    HiringContactSchema,
    ColdEmailGenerateRequest,
    ColdEmailDraftResponse,
    ColdEmailDraftUpdate,
    OutreachLogResponse,
    DailyQuotaResponse,
)
from app.services.hunter_service import HunterService
from app.services.cold_email_service import ColdEmailService
from app.services.email_delivery_service import EmailDeliveryService

router = APIRouter(prefix="/outreach", tags=["outreach"])
hunter_service = HunterService()
cold_email_service = ColdEmailService()
delivery_service = EmailDeliveryService()


@router.post("/contacts/{job_id}", response_model=List[HiringContactSchema])
async def find_hiring_contacts(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Enriches company contact info via Hunter.io Domain Search API.
    Returns hiring managers, talent leads, and engineering leadership with verified email & confidence score.
    Zero scraping of LinkedIn.
    """
    job = db.query(JobSeen).filter(JobSeen.id == job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    contacts = await hunter_service.find_company_contacts(job.company, job.apply_url)
    return contacts


@router.post("/generate", response_model=ColdEmailDraftResponse)
async def generate_cold_email_draft(
    data: ColdEmailGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Generates a personalized 3-paragraph cold email draft via Claude API
    combining job requirements, recipient contact details, and candidate accomplishments.
    """
    job = db.query(JobSeen).filter(JobSeen.id == data.job_id, JobSeen.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    master_profile = _get_or_create_profile(db, current_user.id)
    tailored_resume = (
        db.query(TailoredResume)
        .filter(TailoredResume.job_id == data.job_id, TailoredResume.user_id == current_user.id)
        .order_by(TailoredResume.version_number.desc())
        .first()
    )

    result = await cold_email_service.generate_cold_email(
        master_profile=master_profile,
        job=job,
        tailored_resume=tailored_resume,
        contact_name=data.contact_name,
        contact_title=data.contact_title or "Hiring Manager"
    )

    draft = ColdEmailDraft(
        user_id=current_user.id,
        job_id=data.job_id,
        contact_name=data.contact_name,
        contact_title=data.contact_title,
        contact_email=data.contact_email,
        confidence_score=data.confidence_score or 90,
        subject=result["subject"],
        body=result["body"],
        status="draft"
    )

    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.post("/send/{draft_id}", response_model=OutreachLogResponse)
async def send_cold_email(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Dispatches the approved cold email via SendGrid/SMTP identity.
    Enforces a strict daily send cap of 15 emails/day, appends CAN-SPAM opt-out footer line,
    and logs record to `outreach` table.
    """
    draft = (
        db.query(ColdEmailDraft)
        .filter(ColdEmailDraft.id == draft_id, ColdEmailDraft.user_id == current_user.id)
        .first()
    )
    if not draft:
        raise HTTPException(status_code=404, detail="Cold email draft not found")

    outreach_record = await delivery_service.send_cold_email(db, draft, current_user)
    return outreach_record


@router.get("/quota", response_model=DailyQuotaResponse)
def get_daily_quota_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns daily cold email send quota stats (sent_today, daily_cap=15, remaining).
    """
    stats = delivery_service.get_daily_send_stats(db, current_user)
    return stats


@router.get("/log", response_model=List[OutreachLogResponse])
def get_outreach_log(
    job_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns list of sent cold email records from `outreach` table.
    """
    query = db.query(Outreach).filter(Outreach.user_id == current_user.id)
    if job_id:
        query = query.filter(Outreach.job_id == job_id)

    logs = query.order_by(Outreach.sent_at.desc()).all()
    return logs


@router.get("/job/{job_id}", response_model=List[ColdEmailDraftResponse])
def get_cold_email_drafts_for_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    drafts = (
        db.query(ColdEmailDraft)
        .filter(ColdEmailDraft.job_id == job_id, ColdEmailDraft.user_id == current_user.id)
        .order_by(ColdEmailDraft.created_at.desc())
        .all()
    )
    return drafts


@router.get("/drafts", response_model=List[ColdEmailDraftResponse])
def get_all_cold_email_drafts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    drafts = (
        db.query(ColdEmailDraft)
        .filter(ColdEmailDraft.user_id == current_user.id)
        .order_by(ColdEmailDraft.updated_at.desc())
        .all()
    )
    return drafts


@router.put("/drafts/{draft_id}", response_model=ColdEmailDraftResponse)
def update_cold_email_draft(
    draft_id: int,
    data: ColdEmailDraftUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    draft = (
        db.query(ColdEmailDraft)
        .filter(ColdEmailDraft.id == draft_id, ColdEmailDraft.user_id == current_user.id)
        .first()
    )
    if not draft:
        raise HTTPException(status_code=404, detail="Cold email draft not found")

    if data.subject is not None:
        draft.subject = data.subject
    if data.body is not None:
        draft.body = data.body
    if data.status is not None:
        draft.status = data.status

    draft.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(draft)
    return draft
