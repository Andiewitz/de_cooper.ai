from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.routes import auth, health, lessons

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
        "age": "INTEGER",
        "occupation": "VARCHAR(255)",
        "onboarding_reason": "TEXT",
        "onboarding_completed": "BOOLEAN DEFAULT FALSE"
    }
    
    # Alter table if column is missing
    for col_name, col_type in required_cols.items():
        if col_name not in existing_cols:
            alter_query = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
            await conn.execute(text(alter_query))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only — use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await run_migrations(conn)
    yield
    # Shutdown: dispose engine
    await engine.dispose()


app = FastAPI(
    title="de_cooper.ai API",
    description="An AI teaching platform with the personality of Dr. Sheldon Cooper. You're welcome.",
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

