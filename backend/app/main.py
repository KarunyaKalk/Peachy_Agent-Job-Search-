import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, health, profile, jobs, tailoring, applications, cold_email
from app.services.scheduler import start_job_scheduler

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

@app.on_event("startup")
def on_startup():
    start_job_scheduler(scan_interval_hours=6)

# Parse CORS_ORIGINS from environment variable or use defaults
raw_origins = os.getenv(
    "CORS_ORIGINS",
    "https://karunyakalk.github.io,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
)
allowed_origins_list = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(tailoring.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(cold_email.router, prefix=settings.API_V1_STR)




@app.get("/")
def root():
    return {
        "message": "Welcome to Peachy - AI Job Application Agent API",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "online"
    }
