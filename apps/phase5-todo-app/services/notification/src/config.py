"""Configuration for Notification Service."""
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    service_name: str = "notification-service"
    service_version: str = "5.0.0"
    debug: bool = False
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")
        case_sensitive = False
        extra = "ignore"

settings = Settings()
