"""WebSocket Service - Real-time client synchronization.

Provides WebSocket connections for pushing task and reminder updates
to connected clients, with Dapr pub/sub integration for event-driven
communication.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse

from config import settings
from connections.manager import ConnectionManager
from handlers.task_sync import handle_task_event
from handlers.reminder_push import handle_reminder_event

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Module-level connection manager instance
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    logger.info(
        f"Starting {settings.service_name} v{settings.service_version}"
    )
    yield
    logger.info(
        f"Shutting down {settings.service_name} v{settings.service_version}"
    )


app = FastAPI(
    title=settings.service_name,
    version=settings.service_version,
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.service_version,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = ""):
    """WebSocket endpoint for real-time client connections.

    Accepts connections with a user_id query parameter, manages the
    connection lifecycle, and replays any missed events on connect.

    Args:
        websocket: The WebSocket connection.
        user_id: The unique identifier of the connecting user (query param).
    """
    if not user_id:
        await websocket.close(code=4001, reason="user_id query parameter required")
        return

    await manager.connect(websocket, user_id)

    # Replay any missed events from when the user was offline
    await manager.replay_missed_events(user_id)

    try:
        while True:
            # Keep the connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.debug(f"Received message from user {user_id}: {data}")
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        await manager.disconnect(user_id)


@app.post("/events/task-events")
async def task_events(request: Request):
    """Dapr subscription endpoint for task events.

    Receives CloudEvents from the task-events topic and forwards
    them to connected WebSocket clients.
    """
    cloud_event = await request.json()
    logger.info(f"Received task event: {cloud_event.get('type', 'unknown')}")
    await handle_task_event(cloud_event, manager)
    return JSONResponse(content={"status": "ok"})


@app.post("/events/reminder-events")
async def reminder_events(request: Request):
    """Dapr subscription endpoint for reminder events.

    Receives CloudEvents from the reminder-events topic and pushes
    notifications to connected WebSocket clients. Queues events
    for offline users.
    """
    cloud_event = await request.json()
    logger.info(
        f"Received reminder event: {cloud_event.get('type', 'unknown')}"
    )
    await handle_reminder_event(cloud_event, manager)
    return JSONResponse(content={"status": "ok"})
