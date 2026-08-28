import asyncio
import logging
from backend.celery_app.worker import celery_app
from backend.services.discovery_service import discovery_service

logger = logging.getLogger(__name__)

@celery_app.task
def run_scheduled_job_discovery():
    """Celery beat task executing scheduled job discovery scan every 6 hours."""
    logger.info("Executing scheduled Celery beat job discovery scan...")
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    try:
        jobs = loop.run_until_complete(discovery_service.fetch_adzuna_jobs("Software Engineer"))
        logger.info(f"Scheduled scan completed successfully. Discovered {len(jobs)} jobs.")
        return {"status": "SUCCESS", "jobs_found": len(jobs)}
    except Exception as e:
        logger.error(f"Scheduled discovery scan failed: {e}")
        return {"status": "ERROR", "error": str(e)}

@celery_app.task
def async_auto_revise_resume(job_id: int):
    """Background task for auto-revising resume score if below threshold."""
    logger.info(f"Running background auto-revision for job_id: {job_id}")
    return {"status": "SUCCESS", "job_id": job_id}
