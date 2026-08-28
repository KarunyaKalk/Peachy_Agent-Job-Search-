from celery import Celery
from backend.config import settings

celery_app = Celery(
    "peachy_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "scheduled-job-discovery-scan": {
            "task": "backend.celery_app.tasks.run_scheduled_job_discovery",
            "schedule": 60.0 * 60.0 * settings.scan_frequency_hours,  # Every X hours
        },
    },
)
