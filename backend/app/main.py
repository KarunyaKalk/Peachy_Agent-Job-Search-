from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, health, profile, jobs, tailoring
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

# CORS middleware setup - supports local dev, localhost, and GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://karunyakalk.github.io",
    ],
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


@app.get("/")
def root():
    return {
        "message": "Welcome to Peachy - AI Job Application Agent API",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "online"
    }
