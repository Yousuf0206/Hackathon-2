"""Reminder Push Handler.

Handles incoming reminder events from the Dapr pub/sub and pushes
notifications to connected WebSocket clients. If the target user is
offline, the reminder is queued in the Dapr State Store for later delivery.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx

from connections.manager import ConnectionManager

logger = logging.getLogger(__name__)

DAPR_STATE_URL = "http://localhost:3500/v1.0/state/todo-statestore"


async def handle_reminder_event(
    cloud_event: Dict[str, Any], manager: ConnectionManager
) -> None:
    """Parse a reminder cloud event and push it to the connected user.

    If the user is offline, the reminder is queued in the Dapr State Store
    under the key reminder-queue:{user_id} for replay on reconnect.

    Args:
        cloud_event: The CloudEvents-formatted reminder event from Dapr pub/sub.
        manager: The WebSocket connection manager instance.
    """
    try:
        event_data = cloud_event.get("data", {})
        user_id = event_data.get("user_id")
        reminder_id = event_data.get("reminder_id")
        task_id = event_data.get("task_id")

        if not user_id:
            logger.warning(
                f"Reminder event missing user_id, reminder_id={reminder_id}"
            )
            return

        logger.info(
            f"Processing reminder event: reminder_id={reminder_id}, "
            f"task_id={task_id}, user_id={user_id}"
        )

        # Build the WebSocket notification message
        ws_message = {
            "type": "reminder",
            "source": "live",
            "data": event_data,
        }

        # Check if user is connected
        if user_id in manager.active_connections:
            await manager.send_to_user(user_id, ws_message)
            logger.info(f"Pushed reminder {reminder_id} to user {user_id}")
        else:
            # User is offline - queue the reminder for later delivery
            logger.info(
                f"User {user_id} is offline, queuing reminder {reminder_id}"
            )
            await _queue_reminder(user_id, reminder_id, task_id)

    except Exception as e:
        logger.error(f"Error handling reminder event: {e}", exc_info=True)


async def _queue_reminder(
    user_id: str, reminder_id: str, task_id: str
) -> None:
    """Queue a reminder in the Dapr State Store for offline users.

    Args:
        user_id: The unique identifier of the target user.
        reminder_id: The unique identifier of the reminder.
        task_id: The unique identifier of the associated task.
    """
    queue_key = f"reminder-queue:{user_id}"
    queue_entry = {
        "reminder_id": reminder_id,
        "task_id": task_id,
        "triggered_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        async with httpx.AsyncClient() as client:
            # Fetch existing queue
            existing_queue: List[Dict[str, Any]] = []
            response = await client.get(f"{DAPR_STATE_URL}/{queue_key}")
            if response.status_code == 200 and response.text:
                existing_data = response.json()
                if isinstance(existing_data, list):
                    existing_queue = existing_data

            # Append new entry
            existing_queue.append(queue_entry)

            # Save updated queue
            await client.post(
                DAPR_STATE_URL,
                json=[{"key": queue_key, "value": existing_queue}],
            )
            logger.info(
                f"Queued reminder {reminder_id} for user {user_id} "
                f"(queue size: {len(existing_queue)})"
            )
    except Exception as e:
        logger.error(
            f"Failed to queue reminder {reminder_id} for user {user_id}: {e}"
        )
