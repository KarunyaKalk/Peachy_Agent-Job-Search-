import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Peachy Job Agent API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Auth & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "peachy_secret_key_change_in_production_3948271")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database & Cache
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./peachy.db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # External API Credentials
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    SENDGRID_API_KEY: Optional[str] = os.getenv("SENDGRID_API_KEY", "")
    HUNTER_API_KEY: Optional[str] = os.getenv("HUNTER_API_KEY", "")
    APOLLO_API_KEY: Optional[str] = os.getenv("APOLLO_API_KEY", "")
    ADZUNA_APP_ID: Optional[str] = os.getenv("ADZUNA_APP_ID", "")
    ADZUNA_APP_KEY: Optional[str] = os.getenv("ADZUNA_APP_KEY", "")
    RAPIDAPI_KEY: Optional[str] = os.getenv("RAPIDAPI_KEY", "")
    
    # Scraper Credentials
    HAVELOC_USER: Optional[str] = os.getenv("HAVELOC_USER", "")
    HAVELOC_PASS: Optional[str] = os.getenv("HAVELOC_PASS", "")
    
    # User Default Identity for Testing & Cold Email
    USER_EMAIL: str = os.getenv("USER_EMAIL", "user@example.com")
    USER_NAME: str = os.getenv("USER_NAME", "Peachy User")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://*.github.io",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
