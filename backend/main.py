import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import engine, Base
from backend.routers import (
    auth,
    profile,
    jobs,
    resumes,
    applications,
    outreach,
    interview,
    settings as user_settings,
    audit
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Peachy Personal AI Job Application Agent API Service"
)

# CORS middleware locked to frontend origin + localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount generated PDFs directory
os.makedirs("generated_pdfs", exist_ok=True)
app.mount("/generated_pdfs", StaticFiles(directory="generated_pdfs"), name="generated_pdfs")

# Include Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(applications.router)
app.include_router(outreach.router)
app.include_router(interview.router)
app.include_router(user_settings.router)
app.include_router(audit.router)

@app.on_event("startup")
async def startup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
@app.get("/health")
async def root():
    return {
        "status": "ONLINE",
        "app": "Peachy Personal AI Job Agent Backend",
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
