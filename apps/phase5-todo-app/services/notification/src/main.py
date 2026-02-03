"""
Notification Service -- Phase V Event-Driven Architecture.
Handles reminder scheduling callbacks and delivery via Dapr Jobs API
and WebSocket push.
"""
from fastapi import FastAPI, Request, status
from contextlib import asynccontextmanager
from config import settings
from handlers.reminder import (
    handle_reminder_job_callback,
    handle_task_deleted,
    handle_reminder_scheduled,
)
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Notification Service...")
    logger.info(
        f"Service: {settings.service_name} v{settings.service_version}"
    )
    logger.info("Notification Service ready")
    yield
    logger.info("Shutting down Notification Service...")


app = FastAPI(
    title="Notification Service",
    description="Reminder scheduling and delivery for Phase V",
    version=settings.service_version,
    lifespan=lifespan,
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.service_version,
    }


@app.api_route("/job/reminder-{name}", methods=["POST", "PUT"])
async def job_reminder_callback(name: str, request: Request):
    """
    Dapr Jobs callback endpoint.
    When a scheduled reminder job fires, Dapr calls this endpoint.
    Route pattern: /job/reminder-{name}
    """
    body = await request.json()
    logger.info(f"Dapr Job callback received for reminder: {name}")

    # Extract job data - Dapr Jobs wraps the payload in a 'data' field
    data = body.get("data", body)

    result = await handle_reminder_job_callback(data)
    return result


@app.post("/events/task-events")
async def handle_task_events(request: Request):
    """
    Dapr subscription handler for task-events topic.
    Listens for TaskDeleted events to cancel associated reminder jobs.
    """
    cloud_event = await request.json()
    event_type = cloud_event.get("type", "")

    if event_type == "com.todo.task.deleted.v1":
        result = await handle_task_deleted(cloud_event)
        return result

    # Ignore other task events
    logger.debug(f"Ignoring task event type: {event_type}")
    return {"status": "SUCCESS"}


@app.post("/events/reminder-events")
async def handle_reminder_events(request: Request):
    """
    Dapr subscription handler for reminder-events topic.
    Listens for ReminderScheduled events.
    """
    cloud_event = await request.json()
    event_type = cloud_event.get("type", "")

    if event_type == "com.todo.reminder.scheduled.v1":
        result = await handle_reminder_scheduled(cloud_event)
        return result

    # Ignore other reminder events (triggered, delivered, failed are outbound)
    logger.debug(f"Ignoring reminder event type: {event_type}")
    return {"status": "SUCCESS"}
