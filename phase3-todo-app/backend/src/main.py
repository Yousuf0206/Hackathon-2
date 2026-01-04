"""
FastAPI application entry point.
T018: FastAPI app with CORS, database connection validation, health check.
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .database import engine
from sqlmodel import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Validates database connection on startup.
    """
    # Startup: Validate database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection validated successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise

    yield

    # Shutdown: Clean up if needed
    engine.dispose()


# Create FastAPI app
app = FastAPI(
    title="Phase II Todo API",
    description="Multi-user todo application with JWT authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.cors_origins.split(",")
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
        "service": "phase2-todo-api"
    }


# Import and mount routers
# T027: Mount auth router
from .api import auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# T034: Mount todos router
from .api import todos
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])
