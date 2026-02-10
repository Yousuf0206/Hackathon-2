"""
FastAPI application entry point.
T018: FastAPI app with CORS, database connection validation, health check.
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import engine, init_db
from sqlmodel import text
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database and validates connection on startup.
    """
    logger.info("Starting Phase V Chat API...")

    # Startup: Initialize database tables
    try:
        init_db()
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

    # Validate database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection validated successfully")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise

    # Validate DeepSeek API key
    if not settings.deepseek_api_key:
        logger.warning("⚠️ DEEPSEEK_API_KEY is not set - chat functionality will not work")
    else:
        logger.info("✅ DeepSeek API key configured")

    logger.info(f"✅ Backend ready on http://0.0.0.0:8000")
    logger.info(f"📝 API documentation: http://0.0.0.0:8000/docs")

    yield

    # Shutdown: Clean up if needed
    logger.info("🛑 Shutting down backend...")
    engine.dispose()


# Create FastAPI app
app = FastAPI(
    title="Phase V Chat API",
    description="Event-driven cloud-native todo AI platform",
    version="5.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint.
    Returns 200 OK if service is running.
    """
    return {
        "status": "healthy",
        "service": "chat-api",
        "version": "5.0.0"
    }


# Import and mount routers
# T027: Mount auth router
from api import auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# T034: Mount todos router
from api import todos
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])

# Phase IV: Mount tasks router (task view pages)
from api import tasks
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

# Phase V: Mount recurrence rules router
from api import recurrence_rules
app.include_router(recurrence_rules.router, prefix="/api/recurrence-rules", tags=["recurrence-rules"])

# Phase III: Mount chat router
from api import chat
app.include_router(chat.router, prefix="/api", tags=["chat"])
