from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.settings import SystemSettings
from app.schemas.settings import SystemSettingsResponse, SystemSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


def _get_or_create_settings(db: Session, user_id: int) -> SystemSettings:
    settings_rec = db.query(SystemSettings).filter(SystemSettings.user_id == user_id).first()
    if not settings_rec:
        settings_rec = SystemSettings(user_id=user_id)
        db.add(settings_rec)
        db.commit()
        db.refresh(settings_rec)
    return settings_rec


@router.get("", response_model=SystemSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Returns central system configuration for current user.
    """
    return _get_or_create_settings(db, current_user.id)


@router.put("", response_model=SystemSettingsResponse)
def update_user_settings(
    data: SystemSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Updates scan frequency, score threshold, daily caps, platform toggles, and webhook URLs.
    """
    settings_rec = _get_or_create_settings(db, current_user.id)

    update_dict = data.dict(exclude_unset=True)
    for field, val in update_dict.items():
        if val is not None:
            setattr(settings_rec, field, val)

    db.commit()
    db.refresh(settings_rec)
    return settings_rec
