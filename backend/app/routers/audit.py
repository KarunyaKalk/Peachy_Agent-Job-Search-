from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse, AuditLogCreate

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status (success/warning/error/captcha_blocked)"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns filterable audit activity trail for current user.
    """
    query = db.query(AuditLog).filter(AuditLog.user_id == current_user.id)

    if category and category.lower() != "all":
        query = query.filter(AuditLog.category == category)
    if status and status.lower() != "all":
        query = query.filter(AuditLog.status == status)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs


@router.post("", response_model=AuditLogResponse)
def create_audit_log_entry(
    data: AuditLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Manually inject or log an audit entry.
    """
    log_entry = AuditLog(
        user_id=current_user.id,
        category=data.category,
        action=data.action,
        details=data.details,
        status=data.status or "success",
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
