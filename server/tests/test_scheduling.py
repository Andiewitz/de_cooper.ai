import pytest
from datetime import datetime, timezone, date
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user
from app.models.models import User, Lesson, Message, Flashcard
from app.core.database import get_db, async_session_factory
from sqlalchemy import select, delete


@pytest.fixture
def unique_user_id():
    return str(uuid.uuid4())


@pytest.fixture
def unique_email(unique_user_id):
    return f"test_{unique_user_id[:8]}@example.com"


@pytest.fixture
def test_user(unique_user_id, unique_email):
    return User(
        id=unique_user_id,
        email=unique_email,
        username=f"user_{unique_user_id[:8]}",
        hashed_password="hashed_password",
        display_name="Flashcard User",
    )


@pytest.fixture
def client(test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_chat_generates_inline_flashcards(client, test_user):
    """Test that a ```flashcards block in the AI response saves flashcards to the DB."""
    # Insert user and lesson into the test database
    async with async_session_factory() as session:
        session.add(test_user)
        await session.commit()
        await session.refresh(test_user)

        lesson = Lesson(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            topic_id="physics",
            title="Physics Lesson"
        )
        session.add(lesson)
        await session.commit()
        lesson_id = lesson.id

    # Mock stream_ai_response to yield a flashcards block
    async def mock_stream(*args, **kwargs):
        yield "Here are your flashcards.\n"
        yield "```flashcards\n"
        yield '[{"front": "What is Newton first law?", "back": "An object at rest stays at rest."}, '
        yield '{"front": "What is F=ma?", "back": "Force equals mass times acceleration."}]\n'
        yield "```\n"

    with patch("app.api.routes.lessons.stream_ai_response", side_effect=mock_stream):
        response = client.post(
            f"/api/lessons/{lesson_id}/chat",
            json={"content": "Review my flashcards for this lesson"}
        )
        assert response.status_code == 200
        # Read full stream to trigger generator completion
        content = response.text
        assert "flashcards" in content

    # Verify that Flashcard records were created in the database
    async with async_session_factory() as session:
        result = await session.execute(
            select(Flashcard).where(
                Flashcard.user_id == test_user.id,
                Flashcard.lesson_id == lesson_id
            )
        )
        flashcards = result.scalars().all()
        assert len(flashcards) == 2
        assert flashcards[0].front == "What is Newton first law?"
        assert flashcards[0].back == "An object at rest stays at rest."
        assert flashcards[0].calendar_entry_id is None  # Not tied to calendar
        assert flashcards[1].front == "What is F=ma?"

        # Cleanup
        await session.execute(delete(Flashcard).where(Flashcard.user_id == test_user.id))
        await session.execute(delete(Message).where(Message.lesson_id == lesson_id))
        await session.execute(delete(Lesson).where(Lesson.id == lesson_id))
        await session.execute(delete(User).where(User.id == test_user.id))
        await session.commit()
