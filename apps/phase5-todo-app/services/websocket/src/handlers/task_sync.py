"""Task Event Sync Handler.

Handles incoming task events from the Dapr pub/sub and forwards them
to connected WebSocket clients for real-time synchronization.
"""
import logging
from typing import Any, Dict

from connections.manager import ConnectionManager

logger = logging.getLogger(__name__)

# Supported task event types
TASK_EVENT_TYPES = {"created", "updated", "completed", "deleted"}


async def handle_task_event(
    cloud_event: Dict[str, Any], manager: ConnectionManager
) -> None:
    """Parse a task cloud event and send the update to the appropriate user.

    Args:
        cloud_event: The CloudEvents-formatted task event from Dapr pub/sub.
        manager: The WebSocket connection manager instance.
    """
    try:
        event_data = cloud_event.get("data", {})
        event_type = event_data.get("event_type", "unknown")
        user_id = event_data.get("user_id")
        task_id = event_data.get("task_id")

        if event_type not in TASK_EVENT_TYPES:
            logger.warning(f"Unknown task event type: {event_type}")
            return

        if not user_id:
            logger.warning(
                f"Task event missing user_id, task_id={task_id}, "
                f"event_type={event_type}"
            )
            return

        logger.info(
            f"Processing task event: type={event_type}, "
            f"task_id={task_id}, user_id={user_id}"
        )

        # Build the WebSocket message
        ws_message = {
            "type": "task",
            "event_type": event_type,
            "task_id": task_id,
            "data": event_data,
        }

        await manager.send_to_user(user_id, ws_message)

    except Exception as e:
        logger.error(f"Error handling task event: {e}", exc_info=True)
