from fastapi import APIRouter
from backend.config import settings

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/me")
async def get_current_user():
    """Return single-user authenticated profile details."""
    return {
        "authenticated": True,
        "email": settings.USER_EMAIL,
        "name": settings.USER_NAME,
        "role": "Single User Admin"
    }
