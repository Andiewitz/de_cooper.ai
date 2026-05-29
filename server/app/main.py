from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.routes import auth, health, lessons, calendar

settings = get_settings()


from sqlalchemy import inspect, text

# Safe dynamic columns addition for SQLite and PostgreSQL databases
async def run_migrations(conn):
    # Retrieve metadata info dynamically
    def get_columns(connection):
        inspector = inspect(connection)
        return [c["name"] for c in inspector.get_columns("users")]
        
    existing_cols = await conn.run_sync(get_columns)
    
    # Define columns to verify
    required_cols = {
        "google_id": "VARCHAR(255)",
        "avatar_url": "VARCHAR(1000)",
        "age": "INTEGER",
        "occupation": "VARCHAR(255)",
        "onboarding_reason": "TEXT",
        "onboarding_completed": "BOOLEAN DEFAULT FALSE",
        "last_activity_date": "TIMESTAMP WITH TIME ZONE",
        "current_streak": "INTEGER DEFAULT 0",
        "longest_streak": "INTEGER DEFAULT 0"
    }
    
    # Alter table if column is missing
    for col_name, col_type in required_cols.items():
        if col_name not in existing_cols:
            alter_query = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
            await conn.execute(text(alter_query))


async def cleanup_database_duplicates():
    from app.core.database import async_session_factory
    from app.models import Lesson, Message, CalendarEntry, Flashcard
    from sqlalchemy import select, func, text
    
    async with async_session_factory() as session:
        try:
            # 1. Fetch all lessons
            result = await session.execute(select(Lesson))
            all_lessons = result.scalars().all()
            
            # Group by (user_id, topic_id)
            groups = {}
            for l in all_lessons:
                key = (l.user_id, l.topic_id)
                if key not in groups:
                    groups[key] = []
                groups[key].append(l)
                
            for key, lessons in groups.items():
                if len(lessons) <= 1:
                    continue
                    
                # Count messages for each duplicate
                lesson_msg_counts = []
                for l in lessons:
                    msg_res = await session.execute(
                        select(func.count(Message.id)).where(Message.lesson_id == l.id)
                    )
                    count = msg_res.scalar() or 0
                    lesson_msg_counts.append((count, l.created_at, l))
                
                # Keep the one with most messages, or oldest
                lesson_msg_counts.sort(key=lambda x: (-x[0], x[1]))
                keeper = lesson_msg_counts[0][2]
                duplicates = [x[2] for x in lesson_msg_counts[1:]]
                
                for dup in duplicates:
                    # Update messages
                    await session.execute(
                        text("UPDATE messages SET lesson_id = :keeper_id WHERE lesson_id = :dup_id"),
                        {"keeper_id": keeper.id, "dup_id": dup.id}
                    )
                    # Update flashcards
                    await session.execute(
                        text("UPDATE flashcards SET lesson_id = :keeper_id WHERE lesson_id = :dup_id"),
                        {"keeper_id": keeper.id, "dup_id": dup.id}
                    )
                    # For calendar entries, update them or delete if there's a conflict
                    cal_res = await session.execute(
                        select(CalendarEntry).where(CalendarEntry.lesson_id == dup.id)
                    )
                    cal_entries = cal_res.scalars().all()
                    for entry in cal_entries:
                        # Check if keeper already has a scheduled entry on this date
                        existing_res = await session.execute(
                            select(CalendarEntry).where(
                                CalendarEntry.user_id == key[0],
                                CalendarEntry.scheduled_date == entry.scheduled_date
                            )
                        )
                        existing = existing_res.scalar_one_or_none()
                        if existing:
                            # Re-link flashcards
                            await session.execute(
                                text("UPDATE flashcards SET calendar_entry_id = :est_id WHERE calendar_entry_id = :dup_entry_id"),
                                {"est_id": existing.id, "dup_entry_id": entry.id}
                            )
                            # Delete the duplicate entry
                            await session.delete(entry)
                        else:
                            # Re-link to keeper
                            entry.lesson_id = keeper.id
                            session.add(entry)
                    
                    # Delete duplicate lesson
                    dup_lesson = await session.get(Lesson, dup.id)
                    if dup_lesson:
                        await session.delete(dup_lesson)
                        
            await session.commit()
        except Exception:
            await session.rollback()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only — use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await run_migrations(conn)
        # Migrate flashcards.calendar_entry_id to be nullable (SQLite requires table rebuild)
        await migrate_flashcards_nullable_calendar(conn)
    # Deduplicate existing database records
    await cleanup_database_duplicates()
    yield
    # Shutdown: dispose engine
    await engine.dispose()


async def migrate_flashcards_nullable_calendar(conn):
    """Make flashcards.calendar_entry_id nullable. SQLite doesn't support ALTER COLUMN."""
    def _check_nullable(connection):
        inspector = inspect(connection)
        try:
            columns = inspector.get_columns("flashcards")
        except Exception:
            return True  # Table doesn't exist yet, create_all will handle it
        for col in columns:
            if col["name"] == "calendar_entry_id":
                return col.get("nullable", True)
        return True  # Column not found

    is_nullable = await conn.run_sync(_check_nullable)
    if is_nullable:
        return  # Already nullable, nothing to do

    # SQLite table rebuild: create new table, copy data, swap
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS flashcards_new (
            id VARCHAR(36) NOT NULL PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            calendar_entry_id VARCHAR(36) REFERENCES calendar_entries(id) ON DELETE CASCADE,
            lesson_id VARCHAR(36) NOT NULL REFERENCES lessons(id),
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            metadata_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))
    await conn.execute(text("""
        INSERT INTO flashcards_new (id, user_id, calendar_entry_id, lesson_id, front, back, metadata_json, created_at)
        SELECT id, user_id, calendar_entry_id, lesson_id, front, back, metadata_json, created_at
        FROM flashcards
    """))
    await conn.execute(text("DROP TABLE flashcards"))
    await conn.execute(text("ALTER TABLE flashcards_new RENAME TO flashcards"))


app = FastAPI(
    title="de_study.ai API",
    description="An AI-powered premium teaching platform and STEM study calendar workspace.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")


# Static files serving
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Determine client static out directory (monorepo structure)
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "client", "out"))

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    # Check if request is for API
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    # Otherwise, fall back to index.html or 404.html in the static directory
    fallback_path = os.path.join(static_dir, "404.html")
    if not os.path.exists(fallback_path):
        fallback_path = os.path.join(static_dir, "index.html")
        
    if os.path.exists(fallback_path):
        return FileResponse(fallback_path)
    
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

# Only mount static files if the directory exists (allows local API-only testing)
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

