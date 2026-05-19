from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.routes import auth, health, lessons

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only — use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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


@app.get("/")
async def root():
    return {
        "app": "de_cooper.ai",
        "tagline": "I cry because others are stupid, and that makes me sad.",
        "docs": "/docs",
    }
