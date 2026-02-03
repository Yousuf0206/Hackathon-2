"""
Audit event handler — processes CloudEvents and logs them immutably.
Implements idempotent processing via Dapr State Store.
"""
import httpx
import logging
from datetime import datetime
from sqlmodel import Session
from models.audit_entry import AuditEntry

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = 3500
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
STATE_STORE_NAME = "todo-statestore"
SERVICE_NAME = "audit-service"
IDEMPOTENCY_TTL_SECONDS = 86400  # 24 hours


async def is_duplicate(event_id: str) -> bool:
    """Check if event was already processed via Dapr State Store."""
    key = f"idempotency:{SERVICE_NAME}:{event_id}"
    url = f"{DAPR_BASE_URL}/v1.0/state/{STATE_STORE_NAME}/{key}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200 and response.text:
                return True
            return False
    except httpx.ConnectError:
        logger.warning("Dapr sidecar not available for idempotency check")
        return False
    except Exception as e:
        logger.error(f"Idempotency check error: {e}")
        return False


async def mark_processed(event_id: str) -> None:
    """Mark event as processed in Dapr State Store."""
    key = f"idempotency:{SERVICE_NAME}:{event_id}"
    url = f"{DAPR_BASE_URL}/v1.0/state/{STATE_STORE_NAME}"
    payload = [
        {
            "key": key,
            "value": {"processed_at": datetime.utcnow().isoformat() + "Z"},
            "metadata": {"ttlInSeconds": str(IDEMPOTENCY_TTL_SECONDS)},
        }
    ]
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload, timeout=5.0)
    except Exception as e:
        logger.error(f"Failed to mark event processed: {e}")


async def handle_audit_event(cloud_event: dict, session: Session) -> dict:
    """
    Process a CloudEvent and log it to the audit_entries table.

    Returns a response dict for the Dapr subscription handler.
    """
    event_id = cloud_event.get("id", "")
    event_type = cloud_event.get("type", "")
    source = cloud_event.get("source", "")
    data = cloud_event.get("data", {})
    event_time = cloud_event.get("time", datetime.utcnow().isoformat() + "Z")

    # Idempotency check
    if await is_duplicate(event_id):
        logger.info(f"Duplicate event skipped: {event_id}")
        return {"status": "DROP"}

    # Extract actor_id from event data
    actor_id = data.get("user_id")

    # Parse timestamp
    try:
        timestamp = datetime.fromisoformat(event_time.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        timestamp = datetime.utcnow()

    # INSERT audit entry (immutable — no updates or deletes)
    entry = AuditEntry(
        event_type=event_type,
        event_id=event_id,
        source=source,
        actor_id=actor_id,
        payload=cloud_event,
        timestamp=timestamp,
    )
    session.add(entry)
    session.commit()

    # Mark as processed
    await mark_processed(event_id)

    logger.info(f"Audit logged: {event_type} (event_id={event_id})")
    return {"status": "SUCCESS"}
