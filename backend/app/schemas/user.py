import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

    @field_validator("email", mode="before")
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if len(v) > 100:
                raise ValueError("Email address cannot exceed 100 characters")
        return v


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 128:
            raise ValueError("Password cannot exceed 128 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z)")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z)")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number (0-9)")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", v):
            raise ValueError("Password must contain at least one special character (!@#$%^&*...)")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    def normalize_login_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
