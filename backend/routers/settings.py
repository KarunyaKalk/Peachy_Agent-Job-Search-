from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models.settings import UserSettings
from backend.schemas.settings import UserSettingsBase, UserSettingsResponse

router = APIRouter(prefix="/api/settings", tags=["User Settings"])

@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSettings).order_by(UserSettings.id.asc()))
    s = result.scalars().first()
    if not s:
        s = UserSettings()
        db.add(s)
        await db.commit()
        await db.refresh(s)
    return s

@router.put("", response_model=UserSettingsResponse)
async def update_user_settings(data: UserSettingsBase, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSettings).order_by(UserSettings.id.asc()))
    s = result.scalars().first()
    if not s:
        s = UserSettings()
        db.add(s)
        
    s.scan_frequency_hours = data.scan_frequency_hours
    s.ats_threshold = data.ats_threshold
    s.auto_revise_target_score = data.auto_revise_target_score
    s.daily_app_cap = data.daily_app_cap
    s.daily_email_cap = data.daily_email_cap
    s.platform_toggles = data.platform_toggles
    s.dark_mode = data.dark_mode
    
    await db.commit()
    await db.refresh(s)
    return s
