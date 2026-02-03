"""
Recurring Task Service — Phase V Event-Driven Architecture.
Handles automatic generation of recurring task instances when
a task with a recurrence rule is completed.
"""
from fastapi import FastAPI, Request, status
from contextlib import asynccontextmanager
from config import settings
from handlers.recurrence import handle_task_completed
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Recurring Task Service...")
    logger.info(
        f"Service: {settings.service_name} v{settings.service_version}"
    )
    logger.info("Recurring Task Service ready")
    yield
    logger.info("Shutting down Recurring Task Service...")


app = FastAPI(
    title="Recurring Task Service",
    description="Automatic recurring task generation for Phase V",
    version=settings.service_version,
    lifespan=lifespan,
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.service_version,
    }


@app.post("/events/task-events")
async def handle_task_events(request: Request):
    """Dapr subscription handler for task-events topic."""
    cloud_event = await request.json()
    result = await handle_task_completed(cloud_event)
    return result
