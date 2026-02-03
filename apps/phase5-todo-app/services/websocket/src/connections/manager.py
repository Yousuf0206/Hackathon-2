"""WebSocket Connection Manager.

Manages active WebSocket connections and integrates with Dapr State Store
for connection tracking and missed event replay.
"""
import logging
import socket
from datetime import datetime, timezone
from typing import Dict, Any

import httpx
from fastapi import WebSocket

logger = logging.getLogger(__name__)

DAPR_STATE_URL = "http://localhost:3500/v1.0/state/todo-statestore"


class ConnectionManager:
    """Manages WebSocket connections for real-time client synchronization."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """Accept a WebSocket connection and register it in the Dapr State Store.

        Args:
            websocket: The WebSocket connection to accept.
            user_id: The unique identifier of the connecting user.
        """
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")

        # Register connection in Dapr State Store
        state_key = f"ws-connections:{user_id}"
        state_value = {
            "service_instance": socket.gethostname(),
            "connected_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    DAPR_STATE_URL,
                    json=[{"key": state_key, "value": state_value}],
                )
                response.raise_for_status()
                logger.info(f"Registered connection state for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to register connection state for user {user_id}: {e}")

    async def disconnect(self, user_id: str) -> None:
        """Remove a WebSocket connection and clean up the Dapr State Store.

        Args:
            user_id: The unique identifier of the disconnecting user.
        """
        self.active_connections.pop(user_id, None)
        logger.info(f"User {user_id} disconnected from WebSocket")

        # Clean up connection state in Dapr State Store
        state_key = f"ws-connections:{user_id}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(f"{DAPR_STATE_URL}/{state_key}")
                response.raise_for_status()
                logger.info(f"Cleaned up connection state for user {user_id}")
        except Exception as e:
            logger.error(
                f"Failed to clean up connection state for user {user_id}: {e}"
            )

    async def send_to_user(self, user_id: str, data: Dict[str, Any]) -> None:
        """Send JSON data to a specific user's WebSocket connection.

        Args:
            user_id: The unique identifier of the target user.
            data: The JSON-serializable data to send.
        """
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(data)
                logger.debug(f"Sent data to user {user_id}")
            except Exception as e:
                logger.error(f"Failed to send data to user {user_id}: {e}")
                await self.disconnect(user_id)
        else:
            logger.warning(f"User {user_id} is not connected, cannot send data")

    async def replay_missed_events(self, user_id: str) -> None:
        """Replay missed events for a reconnecting user.

        Checks the Dapr State Store for queued reminders and delivers them
        to the user, then clears the queue.

        Args:
            user_id: The unique identifier of the reconnecting user.
        """
        queue_key = f"reminder-queue:{user_id}"
        try:
            async with httpx.AsyncClient() as client:
                # Fetch queued events
                response = await client.get(f"{DAPR_STATE_URL}/{queue_key}")
                if response.status_code == 200 and response.text:
                    queued_events = response.json()
                    if queued_events and isinstance(queued_events, list):
                        logger.info(
                            f"Replaying {len(queued_events)} missed events "
                            f"for user {user_id}"
                        )
                        for event in queued_events:
                            await self.send_to_user(
                                user_id,
                                {
                                    "type": "reminder",
                                    "source": "replay",
                                    "data": event,
                                },
                            )

                        # Clear the queue after successful delivery
                        await client.delete(f"{DAPR_STATE_URL}/{queue_key}")
                        logger.info(
                            f"Cleared reminder queue for user {user_id}"
                        )
                    else:
                        logger.debug(f"No missed events for user {user_id}")
                else:
                    logger.debug(f"No reminder queue found for user {user_id}")
        except Exception as e:
            logger.error(
                f"Failed to replay missed events for user {user_id}: {e}"
            )
