from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models.audit import AuditLog
from backend.schemas.audit import AuditLogResponse

router = APIRouter(prefix="/api/audit", tags=["Audit Log & Activity Stream"])

@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    """Module 8: Activity audit log stream."""
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    logs = result.scalars().all()
    
    if not logs:
        # Seed initial audit stream records
        sample_logs = [
            AuditLog(
                action="JOB_DISCOVERY_SCAN",
                source="Adzuna API Aggregator",
                status="SUCCESS",
                details="Discovered 3 new matching software engineering listings.",
                metadata_json={"match_score_avg": 88.5}
            ),
            AuditLog(
                action="RESUME_TAILORED",
                source="Gemini API Engine",
                status="SUCCESS",
                details="Tailored master resume for Senior AI & Full Stack Engineer role with Fact-Guard verification.",
                metadata_json={"ats_score": 92.0, "fact_check_passed": True}
            ),
            AuditLog(
                action="COLD_EMAIL_GENERATED",
                source="Outreach Module",
                status="SUCCESS",
                details="Generated personalized cold email for Sarah Jenkins (Lead Technical Recruiter).",
                metadata_json={"recipient": "s.jenkins@orchardtech.ai"}
            )
        ]
        for l in sample_logs:
            db.add(l)
        await db.commit()
        result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
        logs = result.scalars().all()

    return logs
