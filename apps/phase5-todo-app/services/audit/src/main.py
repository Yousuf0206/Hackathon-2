"""
Audit Service — Phase V Event-Driven Architecture.
Consumes all domain events and logs them immutably.
"""
from fastapi import FastAPI, Request, Query, status, Depends
from contextlib import asynccontextmanager
from sqlmodel import create_engine, Session, SQLModel, select
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from config import settings
from models.audit_entry import AuditEntry
from handlers.audit_logger import handle_audit_event
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Database engine
engine_args = {"echo": settings.debug}
if "postgresql" in settings.database_url:
    engine_args.update({"pool_pre_ping": True, "pool_size": 5, "max_overflow": 10})
elif "sqlite" in settings.database_url:
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_args)


def get_session():
    with Session(engine) as session:
        yield session


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Audit Service...")
    SQLModel.metadata.create_all(engine)
    logger.info("Audit Service ready")
    yield
    logger.info("Shutting down Audit Service...")
    engine.dispose()


app = FastAPI(
    title="Audit Service",
    description="Immutable event audit log for Phase V",
    version=settings.service_version,
    lifespan=lifespan,
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": settings.service_version,
    }


@app.post("/events/task-events")
async def handle_task_events(request: Request, session: Session = Depends(get_session)):
    """Dapr subscription handler for task-events topic."""
    cloud_event = await request.json()
    result = await handle_audit_event(cloud_event, session)
    return result


@app.post("/events/reminder-events")
async def handle_reminder_events(request: Request, session: Session = Depends(get_session)):
    """Dapr subscription handler for reminder-events topic."""
    cloud_event = await request.json()
    result = await handle_audit_event(cloud_event, session)
    return result


@app.post("/events/recurring-events")
async def handle_recurring_events(request: Request, session: Session = Depends(get_session)):
    """Dapr subscription handler for recurring-events topic."""
    cloud_event = await request.json()
    result = await handle_audit_event(cloud_event, session)
    return result


# T084: Audit query endpoint
class AuditEntryResponse(BaseModel):
    id: int
    event_type: str
    event_id: str
    source: str
    actor_id: Optional[str]
    timestamp: str
    received_at: str


class AuditQueryResponse(BaseModel):
    entries: List[AuditEntryResponse]
    total: int
    page: int
    page_size: int


@app.get("/audit", response_model=AuditQueryResponse)
async def query_audit_log(
    event_type: Optional[str] = Query(default=None),
    user_id: Optional[str] = Query(default=None, alias="user_id"),
    from_date: Optional[str] = Query(default=None, alias="from"),
    to_date: Optional[str] = Query(default=None, alias="to"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    session: Session = Depends(get_session),
):
    """
    Query audit log entries with filtering and pagination.
    GET /audit?event_type=<type>&user_id=<id>&from=<date>&to=<date>&page=1&page_size=50
    """
    stmt = select(AuditEntry)

    if event_type:
        stmt = stmt.where(AuditEntry.event_type == event_type)
    if user_id:
        stmt = stmt.where(AuditEntry.actor_id == user_id)
    if from_date:
        try:
            from_dt = datetime.fromisoformat(from_date)
            stmt = stmt.where(AuditEntry.timestamp >= from_dt)
        except ValueError:
            pass
    if to_date:
        try:
            to_dt = datetime.fromisoformat(to_date)
            stmt = stmt.where(AuditEntry.timestamp <= to_dt)
        except ValueError:
            pass

    # Count total
    count_stmt = select(AuditEntry)
    if event_type:
        count_stmt = count_stmt.where(AuditEntry.event_type == event_type)
    if user_id:
        count_stmt = count_stmt.where(AuditEntry.actor_id == user_id)
    total = len(list(session.exec(count_stmt).all()))

    # Apply pagination and ordering
    stmt = stmt.order_by(AuditEntry.timestamp.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    entries = session.exec(stmt).all()

    return AuditQueryResponse(
        entries=[
            AuditEntryResponse(
                id=e.id,
                event_type=e.event_type,
                event_id=e.event_id,
                source=e.source,
                actor_id=e.actor_id,
                timestamp=e.timestamp.isoformat() if e.timestamp else "",
                received_at=e.received_at.isoformat() if e.received_at else "",
            )
            for e in entries
        ],
        total=total,
        page=page,
        page_size=page_size,
    )
