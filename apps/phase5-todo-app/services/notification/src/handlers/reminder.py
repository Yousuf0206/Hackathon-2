"""
Reminder handler for the Notification Service.
Processes Dapr Jobs callbacks, publishes reminder lifecycle events,
and handles task deletion by cancelling associated Dapr jobs.
Implements idempotent processing via Dapr State Store.
"""
import httpx
import logging
from datetime import datetime

from events.schemas import (
    EVENT_TYPES,
    ReminderTriggeredData,
    ReminderDeliveredData,
    ReminderFailedData,
)
from events.publisher import publish_event

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = 3500
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
STATE_STORE_NAME = "todo-statestore"
SERVICE_NAME = "notification-service"
IDEMPOTENCY_TTL_SECONDS = 86400  # 24 hours


# --- Idempotency Helpers ---

async def is_duplicate(event_id: str) -> bool:
    """Check if event was already processed via Dapr State Store."""
    key = f"idempotency:{SERVICE_NAME}:{event_id}"
    url = f"{DAPR_BASE_URL}/v1.0/state/{STATE_STORE_NAME}/{key}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200 and response.text:
                logger.debug(f"Duplicate event detected: {key}")
                return True
            return False
    except httpx.ConnectError:
        logger.warning(
            "Dapr sidecar not available for idempotency check. "
            "Treating as non-duplicate."
        )
        return False
    except Exception as e:
        logger.error(f"Error checking idempotency for {key}: {e}")
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


# --- Reminder Job Callback Handler ---

async def handle_reminder_job_callback(data: dict) -> dict:
    """
    Handle Dapr Jobs callback when a reminder fires.

    1. Publish ReminderTriggered.v1 to reminder-events topic.
    2. Push notification to WebSocket Service via Dapr pub/sub.
    3. Call handle_reminder_delivery to track success/failure.

    Args:
        data: Job callback payload containing reminder_id, task_id, user_id.

    Returns:
        Response dict for Dapr.
    """
    reminder_id = data.get("reminder_id", "")
    task_id = data.get("task_id", "")
    user_id = data.get("user_id", "")

    logger.info(
        f"Reminder job callback received: reminder_id={reminder_id}, "
        f"task_id={task_id}, user_id={user_id}"
    )

    # Publish ReminderTriggered event
    triggered_data = ReminderTriggeredData(
        reminder_id=reminder_id,
        task_id=task_id,
        user_id=user_id,
    )
    triggered_ok = await publish_event(
        event_type=EVENT_TYPES["reminder_triggered"],
        source=SERVICE_NAME,
        data=triggered_data,
    )

    # Attempt delivery via WebSocket Service (through Dapr pub/sub)
    await handle_reminder_delivery(
        reminder_id=reminder_id,
        task_id=task_id,
        user_id=user_id,
        delivery_success=triggered_ok,
    )

    return {"status": "SUCCESS"}


# --- Reminder Delivery Handler ---

async def handle_reminder_delivery(
    reminder_id: str,
    task_id: str,
    user_id: str,
    delivery_success: bool = True,
) -> dict:
    """
    Publish delivery result events.

    On success: Publish ReminderDelivered.v1.
    On failure: Publish ReminderFailed.v1.

    Args:
        reminder_id: The reminder identifier.
        task_id: The associated task identifier.
        user_id: The user identifier.
        delivery_success: Whether the delivery was successful.

    Returns:
        Response dict.
    """
    if delivery_success:
        delivered_data = ReminderDeliveredData(
            reminder_id=reminder_id,
            task_id=task_id,
            user_id=user_id,
            delivered_via="websocket",
        )
        await publish_event(
            event_type=EVENT_TYPES["reminder_delivered"],
            source=SERVICE_NAME,
            data=delivered_data,
        )
        logger.info(
            f"Reminder delivered: reminder_id={reminder_id}, "
            f"task_id={task_id}, via=websocket"
        )
        return {"status": "SUCCESS"}
    else:
        failed_data = ReminderFailedData(
            reminder_id=reminder_id,
            task_id=task_id,
            user_id=user_id,
            reason="Failed to publish triggered event or push to WebSocket",
        )
        await publish_event(
            event_type=EVENT_TYPES["reminder_failed"],
            source=SERVICE_NAME,
            data=failed_data,
        )
        logger.error(
            f"Reminder delivery failed: reminder_id={reminder_id}, "
            f"task_id={task_id}"
        )
        return {"status": "FAILED"}


# --- Task Deleted Handler ---

async def handle_task_deleted(cloud_event: dict) -> dict:
    """
    Handle TaskDeleted events by cancelling associated Dapr reminder jobs.

    Cancels the Dapr job via DELETE http://localhost:3500/v1.0-alpha1/jobs/reminder-<id>.

    Args:
        cloud_event: CloudEvents envelope with TaskDeleted data.

    Returns:
        Response dict for Dapr subscription handler.
    """
    event_id = cloud_event.get("id", "")
    event_type = cloud_event.get("type", "")
    data = cloud_event.get("data", {})
    task_id = data.get("task_id", "")
    user_id = data.get("user_id", "")

    # Idempotency check
    if await is_duplicate(event_id):
        logger.info(f"Duplicate event skipped: {event_id}")
        return {"status": "DROP"}

    logger.info(
        f"TaskDeleted event received: task_id={task_id}, "
        f"user_id={user_id}, event_type={event_type}"
    )

    # Cancel the associated reminder job
    job_name = f"reminder-{task_id}"
    url = f"{DAPR_BASE_URL}/v1.0-alpha1/jobs/{job_name}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, timeout=5.0)
            if response.status_code in (200, 204):
                logger.info(f"Cancelled Dapr job {job_name}")
            elif response.status_code == 404:
                logger.info(
                    f"Dapr job {job_name} not found (may have already fired or been cancelled)"
                )
            else:
                logger.error(
                    f"Failed to cancel job {job_name}: "
                    f"status={response.status_code} body={response.text}"
                )
    except httpx.ConnectError:
        logger.warning(
            f"Dapr sidecar not available, skipping job cancel for {job_name}."
        )
    except Exception as e:
        logger.error(f"Error cancelling job {job_name}: {e}")

    # Mark as processed
    await mark_processed(event_id)

    return {"status": "SUCCESS"}


# --- Reminder Scheduled Handler ---

async def handle_reminder_scheduled(cloud_event: dict) -> dict:
    """
    Handle ReminderScheduled events received via pub/sub.
    The scheduling itself is done by chat-api via Dapr Jobs API.
    This handler acknowledges receipt and logs it.

    Args:
        cloud_event: CloudEvents envelope with ReminderScheduled data.

    Returns:
        Response dict for Dapr subscription handler.
    """
    event_id = cloud_event.get("id", "")
    data = cloud_event.get("data", {})
    reminder_id = data.get("reminder_id", "")
    task_id = data.get("task_id", "")
    user_id = data.get("user_id", "")
    trigger_time = data.get("trigger_time", "")

    # Idempotency check
    if await is_duplicate(event_id):
        logger.info(f"Duplicate event skipped: {event_id}")
        return {"status": "DROP"}

    logger.info(
        f"ReminderScheduled received: reminder_id={reminder_id}, "
        f"task_id={task_id}, user_id={user_id}, trigger_time={trigger_time}"
    )

    # Mark as processed
    await mark_processed(event_id)

    return {"status": "SUCCESS"}
