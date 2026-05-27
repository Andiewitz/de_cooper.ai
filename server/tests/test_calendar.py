import pytest
from datetime import datetime, timezone, date
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user
from app.models.models import User, Lesson, Message, CalendarEntry, Flashcard
from app.core.database import get_db, async_session_factory
from sqlalchemy import select

@pytest.fixture
def test_user():
    return User(
        id=str(uuid.uuid4()),
        email="test_calendar@example.com",
        username="calendaruser",
        hashed_password="hashed_password",
        display_name="Calendar User",
    )

@pytest.fixture
def client(test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.mark.anyio
async def test_calendar_endpoints_flow(client, test_user):
    # Set up test data
    async with async_session_factory() as session:
        # Check if user already exists and delete to ensure clean test state
        user_result = await session.execute(
            select(User).where(User.email == "test_calendar@example.com")
        )
        db_user = user_result.scalar_one_or_none()
        if db_user:
            # Delete stale database records
            await session.delete(db_user)
            await session.commit()

        session.add(test_user)
        await session.commit()
        await session.refresh(test_user)

        lesson = Lesson(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            topic_id="mathematics",
            title="Mathematics Lesson"
        )
        session.add(lesson)
        
        # Add a Sheldon message so flashcard generation has material
        message = Message(
            id=str(uuid.uuid4()),
            lesson_id=lesson.id,
            role="sheldon",
            content="Today we will learn about calculus and integrations."
        )
        session.add(message)
        await session.commit()
        lesson_id = lesson.id

    # 1. Test POST /api/calendar/ to schedule
    scheduled_date_str = "2026-07-15"
    response = client.post(
        "/api/calendar/",
        json={"lesson_id": lesson_id, "scheduled_date": scheduled_date_str}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["lesson_title"] == "Mathematics Lesson"
    assert data["lesson_topic_id"] == "mathematics"
    entry_id = data["id"]

    # 2. Test GET /api/calendar/ for month query
    response = client.get(
        "/api/calendar/",
        params={"month": "2026-07"}
    )
    assert response.status_code == 200
    month_data = response.json()
    assert len(month_data) >= 1
    assert any(x["id"] == entry_id for x in month_data)

    # Mock OpenRouter call inside generate_flashcards to return dummy JSON cards
    mock_cards = [{"front": "What is integration?", "back": "The reverse of differentiation."}]
    async def mock_post(*args, **kwargs):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [{
                "message": {
                    "content": '[{"front": "What is integration?", "back": "The reverse of differentiation."}]'
                }
            }]
        }
        return mock_resp

    with patch("app.services.flashcard_service.settings.OPENROUTER_API_KEY", "fake-key"):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            # 3. Test GET /api/calendar/{date}/flashcards (auto-generates)
            response = client.get(f"/api/calendar/{scheduled_date_str}/flashcards")
            assert response.status_code == 200
            day_data = response.json()
            assert day_data["date"] == scheduled_date_str
            assert day_data["lesson"]["id"] == lesson_id
            assert len(day_data["flashcards"]) >= 1
            assert day_data["flashcards"][0]["front"] == "What is integration?"

    # Cleanup database
    async with async_session_factory() as session:
        # Delete flashcards
        await session.execute(
            select(Flashcard).where(Flashcard.calendar_entry_id == entry_id)
        )
        res = await session.execute(
            select(CalendarEntry).where(CalendarEntry.id == entry_id)
        )
        entry = res.scalar_one_or_none()
        if entry:
            await session.delete(entry)
        
        lesson_to_del = await session.get(Lesson, lesson_id)
        if lesson_to_del:
            await session.delete(lesson_to_del)
            
        user_to_del = await session.get(User, test_user.id)
        if user_to_del:
            await session.delete(user_to_del)
            
        await session.commit()
