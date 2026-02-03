"""
Dapr Pub/Sub publish helper for Recurring Task Service.
Publishes CloudEvents to Kafka via Dapr sidecar HTTP API.
Per contracts/event-contracts.md: POST http://localhost:3500/v1.0/publish/todo-pubsub/<topic>
"""
import httpx
import logging
from typing import Optional
from pydantic import BaseModel
from events.schemas import (
    create_cloud_event,
    TOPIC_MAPPING,
)

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = 3500
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
PUBSUB_NAME = "todo-pubsub"


async def publish_event(
    event_type: str,
    source: str,
    data: BaseModel,
    topic: Optional[str] = None,
) -> bool:
    """
    Publish a CloudEvent to Kafka via Dapr Pub/Sub.

    Args:
        event_type: CloudEvents type string (e.g., com.todo.recurring.generated.v1)
        source: Originating service name (e.g., recurring-task-service)
        data: Pydantic model with event payload
        topic: Override Kafka topic (defaults to lookup from TOPIC_MAPPING)

    Returns:
        True if publish succeeded, False otherwise
    """
    if topic is None:
        topic = TOPIC_MAPPING.get(event_type)
        if topic is None:
            logger.error(f"No topic mapping for event type: {event_type}")
            return False

    cloud_event = create_cloud_event(event_type, source, data)
    url = f"{DAPR_BASE_URL}/v1.0/publish/{PUBSUB_NAME}/{topic}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=cloud_event,
                headers={"Content-Type": "application/cloudevents+json"},
                timeout=5.0,
            )
            if response.status_code in (200, 204):
                logger.info(
                    f"Published {event_type} to {topic} "
                    f"(event_id={cloud_event['id']})"
                )
                return True
            else:
                logger.error(
                    f"Failed to publish {event_type} to {topic}: "
                    f"status={response.status_code} body={response.text}"
                )
                return False
    except httpx.ConnectError:
        logger.warning(
            f"Dapr sidecar not available, skipping publish of {event_type}. "
            "This is expected in local development without Dapr."
        )
        return False
    except Exception as e:
        logger.error(f"Error publishing {event_type}: {e}")
        return False
