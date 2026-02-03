"""
Recurrence handler — processes TaskCompleted events and generates
the next recurring task instance when a recurrence rule is active.
Implements idempotent processing via Dapr State Store.
"""
import httpx
import logging
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from events.schemas import (
    EVENT_TYPES,
    RecurringTaskGeneratedData,
)
from events.publisher import publish_event

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = 3500
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
STATE_STORE_NAME = "todo-statestore"
SERVICE_NAME = "recurring-task-service"
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


def calculate_next_due_date(current_due_date: str, frequency: str) -> str:
    """
    Calculate the next due date based on the recurrence frequency.

    Args:
        current_due_date: ISO format date string of the current due date
        frequency: One of 'daily', 'weekly', 'monthly'

    Returns:
        ISO format date string for the next occurrence
    """
    try:
        due = datetime.fromisoformat(current_due_date.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        due = datetime.utcnow()

    if frequency == "daily":
        next_due = due + timedelta(days=1)
    elif frequency == "weekly":
        next_due = due + timedelta(days=7)
    elif frequency == "monthly":
        next_due = due + relativedelta(months=1)
    else:
        logger.warning(f"Unknown frequency '{frequency}', defaulting to daily")
        next_due = due + timedelta(days=1)

    return next_due.isoformat()


async def get_recurrence_rule(recurrence_rule_id: str) -> dict | None:
    """
    Look up a recurrence rule via Dapr Service Invocation to Chat API.

    Returns:
        The recurrence rule dict, or None if not found.
    """
    url = (
        f"{DAPR_BASE_URL}/v1.0/invoke/chat-api/method"
        f"/api/recurrence-rules/{recurrence_rule_id}"
    )
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                rule = response.json()
                logger.info(f"Retrieved recurrence rule: {recurrence_rule_id}")
                return rule
            else:
                logger.error(
                    f"Failed to get recurrence rule {recurrence_rule_id}: "
                    f"status={response.status_code}"
                )
                return None
    except httpx.ConnectError:
        logger.warning(
            "Dapr sidecar not available for service invocation to chat-api"
        )
        return None
    except Exception as e:
        logger.error(f"Error fetching recurrence rule: {e}")
        return None


async def update_recurrence_rule(
    recurrence_rule_id: str, updates: dict
) -> bool:
    """
    Update a recurrence rule via Dapr Service Invocation to Chat API.
    """
    url = (
        f"{DAPR_BASE_URL}/v1.0/invoke/chat-api/method"
        f"/api/recurrence-rules/{recurrence_rule_id}"
    )
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(url, json=updates, timeout=10.0)
            if response.status_code in (200, 204):
                logger.info(f"Updated recurrence rule: {recurrence_rule_id}")
                return True
            else:
                logger.error(
                    f"Failed to update recurrence rule {recurrence_rule_id}: "
                    f"status={response.status_code}"
                )
                return False
    except httpx.ConnectError:
        logger.warning(
            "Dapr sidecar not available for service invocation to chat-api"
        )
        return False
    except Exception as e:
        logger.error(f"Error updating recurrence rule: {e}")
        return False


async def create_task(task_data: dict) -> dict | None:
    """
    Create a new task via Dapr Service Invocation to Chat API.

    Returns:
        The created task dict, or None if creation failed.
    """
    url = f"{DAPR_BASE_URL}/v1.0/invoke/chat-api/method/api/tasks"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=task_data, timeout=10.0)
            if response.status_code in (200, 201):
                task = response.json()
                logger.info(f"Created new recurring task: {task.get('id', 'unknown')}")
                return task
            else:
                logger.error(
                    f"Failed to create task: "
                    f"status={response.status_code} body={response.text}"
                )
                return None
    except httpx.ConnectError:
        logger.warning(
            "Dapr sidecar not available for service invocation to chat-api"
        )
        return None
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        return None


async def handle_task_completed(cloud_event: dict) -> dict:
    """
    Handle a TaskCompleted.v1 CloudEvent.

    When a completed task has a recurrence rule:
    1. Check idempotency
    2. Look up the recurrence rule
    3. Check termination conditions (end_after_count, end_by_date)
    4. Calculate next due date
    5. Create new task instance
    6. Increment occurrences_generated
    7. Publish RecurringTaskGenerated.v1 event
    8. Mark event as processed

    Returns:
        A response dict for the Dapr subscription handler.
    """
    event_id = cloud_event.get("id", "")
    event_type = cloud_event.get("type", "")
    data = cloud_event.get("data", {})

    logger.info(f"Received event: {event_type} (id={event_id})")

    # Only process TaskCompleted events with recurrence rules
    if event_type != "com.todo.task.completed.v1":
        logger.debug(f"Ignoring non-TaskCompleted event: {event_type}")
        return {"status": "SUCCESS"}

    had_recurrence_rule = data.get("had_recurrence_rule", False)
    if not had_recurrence_rule:
        logger.debug(f"Task {data.get('task_id')} has no recurrence rule, skipping")
        return {"status": "SUCCESS"}

    recurrence_rule_id = data.get("recurrence_rule_id")
    if not recurrence_rule_id:
        logger.warning(f"TaskCompleted event has had_recurrence_rule=true but no recurrence_rule_id")
        return {"status": "SUCCESS"}

    # Step 1: Idempotency check
    if await is_duplicate(event_id):
        logger.info(f"Duplicate event skipped: {event_id}")
        return {"status": "DROP"}

    task_id = data.get("task_id", "")
    user_id = data.get("user_id", "")

    logger.info(
        f"Processing recurrence for task {task_id}, "
        f"rule {recurrence_rule_id}"
    )

    # Step 2: Look up recurrence rule via Dapr Service Invocation
    rule = await get_recurrence_rule(recurrence_rule_id)
    if rule is None:
        logger.error(f"Could not retrieve recurrence rule {recurrence_rule_id}")
        return {"status": "RETRY"}

    frequency = rule.get("frequency", "daily")
    is_active = rule.get("is_active", True)
    end_after_count = rule.get("end_after_count")
    end_by_date = rule.get("end_by_date")
    occurrences_generated = rule.get("occurrences_generated", 0)
    base_due_date = rule.get("base_due_date") or data.get("due_date")

    if not is_active:
        logger.info(f"Recurrence rule {recurrence_rule_id} is inactive, skipping")
        await mark_processed(event_id)
        return {"status": "SUCCESS"}

    # Step 3: Check termination — end_after_count
    if end_after_count is not None and occurrences_generated >= end_after_count:
        logger.info(
            f"Recurrence rule {recurrence_rule_id} reached max count "
            f"({occurrences_generated}/{end_after_count}), deactivating"
        )
        await update_recurrence_rule(
            recurrence_rule_id, {"is_active": False}
        )
        await mark_processed(event_id)
        return {"status": "SUCCESS"}

    # Step 4: Check termination — end_by_date
    if end_by_date is not None:
        try:
            end_dt = datetime.fromisoformat(end_by_date.replace("Z", "+00:00"))
            if datetime.utcnow().replace(tzinfo=end_dt.tzinfo) >= end_dt:
                logger.info(
                    f"Recurrence rule {recurrence_rule_id} past end_by_date "
                    f"({end_by_date}), deactivating"
                )
                await update_recurrence_rule(
                    recurrence_rule_id, {"is_active": False}
                )
                await mark_processed(event_id)
                return {"status": "SUCCESS"}
        except (ValueError, AttributeError) as e:
            logger.warning(f"Invalid end_by_date '{end_by_date}': {e}")

    # Step 5: Calculate next due date
    current_due_date = base_due_date or datetime.utcnow().isoformat() + "Z"
    next_due_date = calculate_next_due_date(current_due_date, frequency)

    logger.info(
        f"Next occurrence due: {next_due_date} (frequency={frequency})"
    )

    # Step 6: Create new task via Dapr Service Invocation
    new_task_data = {
        "user_id": user_id,
        "title": rule.get("base_title", f"Recurring task from {task_id}"),
        "description": rule.get("base_description", ""),
        "due_date": next_due_date,
        "recurrence_rule_id": recurrence_rule_id,
    }

    new_task = await create_task(new_task_data)
    if new_task is None:
        logger.error("Failed to create new recurring task instance")
        return {"status": "RETRY"}

    new_task_id = new_task.get("id", "unknown")
    new_occurrence_number = occurrences_generated + 1

    # Step 7: Increment occurrences_generated
    await update_recurrence_rule(
        recurrence_rule_id,
        {
            "occurrences_generated": new_occurrence_number,
            "base_due_date": next_due_date,
        },
    )

    # Step 8: Publish RecurringTaskGenerated.v1 event
    event_data = RecurringTaskGeneratedData(
        original_task_id=task_id,
        new_task_id=new_task_id,
        user_id=user_id,
        recurrence_rule_id=recurrence_rule_id,
        occurrence_number=new_occurrence_number,
    )

    await publish_event(
        event_type=EVENT_TYPES["recurring_generated"],
        source=SERVICE_NAME,
        data=event_data,
    )

    # Step 9: Mark event as processed
    await mark_processed(event_id)

    logger.info(
        f"Recurring task generated: {new_task_id} "
        f"(occurrence #{new_occurrence_number} from rule {recurrence_rule_id})"
    )
    return {"status": "SUCCESS"}
