"""
Idempotency helper using Dapr State Store.
Key pattern: idempotency:{service}:{event_id}
TTL: 24 hours (86400 seconds)
Per data-model.md and contracts/event-contracts.md.
"""
import httpx
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = 3500
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
STATE_STORE_NAME = "todo-statestore"
IDEMPOTENCY_TTL_SECONDS = 86400  # 24 hours


async def is_duplicate(service: str, event_id: str) -> bool:
    """
    Check if an event has already been processed.

    Args:
        service: Service name (e.g., audit-service)
        event_id: CloudEvents event ID

    Returns:
        True if the event was already processed (duplicate), False otherwise
    """
    key = f"idempotency:{service}:{event_id}"
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


async def mark_processed(service: str, event_id: str) -> bool:
    """
    Mark an event as processed in the Dapr State Store.

    Args:
        service: Service name (e.g., audit-service)
        event_id: CloudEvents event ID

    Returns:
        True if marking succeeded, False otherwise
    """
    key = f"idempotency:{service}:{event_id}"
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
            response = await client.post(
                url, json=payload, timeout=5.0
            )
            if response.status_code in (200, 204):
                logger.debug(f"Marked event as processed: {key}")
                return True
            else:
                logger.error(
                    f"Failed to mark event {key}: "
                    f"status={response.status_code} body={response.text}"
                )
                return False
    except httpx.ConnectError:
        logger.warning(
            "Dapr sidecar not available for idempotency marking."
        )
        return False
    except Exception as e:
        logger.error(f"Error marking event {key}: {e}")
        return False
