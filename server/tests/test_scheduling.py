import pytest
from datetime import datetime, timezone, date
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user
from app.models.models import User, Lesson, Message, CalendarEntry
from app.core.database import get_db, async_session_factory
from sqlalchemy import select

@pytest.fixture
def test_user():
    return User(
        id=str(uuid.uuid4()),
        email="test_schedule@example.com",
        username="scheduleuser",
        hashed_password="hashed_password",
        display_name="Schedule User",
    )

@pytest.fixture
def client(test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.mark.anyio
async def test_chat_schedules_flashcards(client, test_user):
    # Set up user and lesson in a test db session
    async with async_session_factory() as session:
        # Check if user already exists to avoid unique constraint violations
        user_result = await session.execute(
            select(User).where(User.email == "test_schedule@example.com")
        )
        db_user = user_result.scalar_one_or_none()
        if not db_user:
            session.add(test_user)
            await session.commit()
            await session.refresh(test_user)
        else:
            test_user = db_user

        lesson = Lesson(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            topic_id="physics",
            title="Physics Lesson"
        )
        session.add(lesson)
        await session.commit()
        lesson_id = lesson.id

    # Mock stream_ai_response to yield a scheduling block
    async def mock_stream(*args, **kwargs):
        yield "Sure. I have scheduled a session.\n"
        yield "```schedule-flashcards\n"
        yield '{"date": "2026-06-05"}\n'
        yield "```\n"

    with patch("app.api.routes.lessons.stream_ai_response", side_effect=mock_stream):
        response = client.post(
            f"/api/lessons/{lesson_id}/chat",
            json={"content": "Please schedule flashcards for June 5th"}
        )
        assert response.status_code == 200
        # Read full stream to trigger generator completion
        content = response.text
        assert "schedule-flashcards" in content

    # Verify that a CalendarEntry was created in the database
    async with async_session_factory() as session:
        result = await session.execute(
            select(CalendarEntry).where(
                CalendarEntry.user_id == test_user.id,
                CalendarEntry.lesson_id == lesson_id
            )
        )
        entry = result.scalar_one_or_none()
        assert entry is not None
        assert entry.scheduled_date == date(2026, 6, 5)

        # Cleanup test data to keep database clean
        await session.delete(entry)
        lesson_to_del = await session.get(Lesson, lesson_id)
        if lesson_to_del:
            await session.delete(lesson_to_del)
        user_to_del = await session.get(User, test_user.id)
        if user_to_del:
            await session.delete(user_to_del)
        await session.commit()
