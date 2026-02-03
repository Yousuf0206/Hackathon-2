"""
Structured JSON logging configuration for Phase V services.
Provides event-level correlation IDs (service name, event_id, timestamp).
"""
import json
import logging
import sys
from datetime import datetime


class JSONFormatter(logging.Formatter):
    """Structured JSON log formatter with correlation fields."""

    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": self.service_name,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add event correlation if available
        if hasattr(record, "event_id"):
            log_entry["event_id"] = record.event_id
        if hasattr(record, "event_type"):
            log_entry["event_type"] = record.event_type

        # Add exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def configure_json_logging(service_name: str, level: int = logging.INFO) -> None:
    """Configure structured JSON logging for the service."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter(service_name))

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]
