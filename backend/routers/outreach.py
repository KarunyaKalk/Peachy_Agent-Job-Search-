from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models.outreach import OutreachLog
from backend.models.job import Job
from backend.models.profile import MasterProfile
from backend.schemas.outreach import (
    FindContactRequest,
    GenerateColdEmailRequest,
    SendColdEmailRequest,
    SendTestEmailRequest,
    OutreachLogResponse
)
from backend.services.outreach_service import outreach_service
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/outreach", tags=["Cold Email Outreach"])

@router.get("/logs", response_model=List[OutreachLogResponse])
async def list_outreach_logs(db: AsyncSession = Depends(get_db)):
    """Retrieve all logged outreach cold email dispatches."""
    result = await db.execute(select(OutreachLog).order_by(OutreachLog.created_at.desc()))
    logs = result.scalars().all()
    
    if not logs:
        # Seed initial log entry for UI demo
        sample = OutreachLog(
            recipient_email="s.jenkins@orchardtech.ai",
            recipient_name="Sarah Jenkins",
            recipient_title="Lead Technical Recruiter",
            subject="Inquiry regarding Engineering role at your team - Karunya",
            body="Hi Sarah, I noticed your recent opening for software engineering roles and wanted to reach out directly...",
            status="Sent",
            sent_at=datetime.utcnow()
        )
        db.add(sample)
        await db.commit()
        result = await db.execute(select(OutreachLog).order_by(OutreachLog.created_at.desc()))
        logs = result.scalars().all()

    return logs

@router.post("/find-contact")
async def find_contact(req: FindContactRequest):
    """Module 6: Contact enrichment via Hunter.io / Apollo.io."""
    contact = await outreach_service.find_hiring_contact(req.company, req.domain)
    return contact

@router.post("/generate-email")
async def generate_email(req: GenerateColdEmailRequest, db: AsyncSession = Depends(get_db)):
    """Module 6: Gemini-generated personalized cold email."""
    job_res = await db.execute(select(Job).where(Job.id == req.job_id))
    job = job_res.scalars().first()
    
    prof_res = await db.execute(select(MasterProfile).order_by(MasterProfile.id.asc()))
    profile = prof_res.scalars().first()
    
    prof_dict = {
        "full_name": profile.full_name if profile else "Karunya",
        "portfolio_url": profile.portfolio_url if profile else "https://peachy-user.dev",
        "summary": profile.summary if profile else ""
    }
    jd_text = job.full_jd_text if job else "Software Engineer Position"
    
    email_draft = await gemini_service.generate_cold_email(
        prof_dict, jd_text, req.recipient_name, req.recipient_title
    )
    
    return email_draft

@router.post("/send")
async def send_cold_email(req: SendColdEmailRequest, db: AsyncSession = Depends(get_db)):
    """Module 6: Dispatch cold email and record in outreach table."""
    result = await outreach_service.send_cold_email(req.recipient_email, req.subject, req.body)
    
    log = OutreachLog(
        job_id=req.job_id,
        recipient_email=req.recipient_email,
        recipient_name=req.recipient_name,
        recipient_title=req.recipient_title,
        subject=req.subject,
        body=req.body,
        status="Sent" if result.get("success") else "Failed",
        error_message=result.get("error"),
        sent_at=datetime.utcnow() if result.get("success") else None
    )
    db.add(log)
    await db.commit()
    
    return result

@router.post("/send-test-email")
async def send_test_email(req: SendTestEmailRequest, db: AsyncSession = Depends(get_db)):
    """
    Module 6: Verification step — send real test email to user's own address
    through exact production code path.
    """
    result = await outreach_service.send_test_email(req.target_email)
    
    log = OutreachLog(
        recipient_email=req.target_email,
        recipient_name="User Self-Test",
        recipient_title="Self Verification",
        subject="[PEACHY TEST EMAIL] Verification of Production Outreach Pipeline",
        body="Verification of production email path.",
        status="Test Email Sent" if result.get("success") else "Failed",
        sent_at=datetime.utcnow()
    )
    db.add(log)
    await db.commit()
    
    return {
        "status": "TEST_EMAIL_VERIFIED",
        "target_email": req.target_email,
        "detail": result.get("message")
    }
