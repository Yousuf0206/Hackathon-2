"""
Configuration module for loading environment variables.
T009: Load DATABASE_URL and BETTER_AUTH_SECRET from environment.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    better_auth_secret: str
    cors_origins: str = "http://localhost:3000"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields


# Global settings instance
settings = Settings()
