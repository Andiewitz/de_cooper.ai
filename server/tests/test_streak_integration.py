"""
Integration tests for streak functionality with API endpoints
"""
import pytest
from datetime import datetime, timezone, timedelta
import uuid
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user
from app.models.models import User, Lesson, Message


@pytest.fixture
def test_user():
    """Create a test user"""
    user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password",
        display_name="Test User",
        current_streak=0,
        longest_streak=0,
        last_activity_date=None
    )
    return user


@pytest.fixture
def client(test_user):
    """Create test client with mocked dependency"""
    # Override the get_current_user dependency
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_create_lesson_updates_streak(client, test_user):
    """Test that creating a lesson updates user streak"""
    # Initially no streak
    assert test_user.current_streak == 0
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    
    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)
    mock_db.refresh.side_effect = mock_refresh
    
    # Override get_db dependency
    from app.core.database import get_db
    app.dependency_overrides[get_db] = lambda: mock_db
    
    try:
        # Make request to create lesson
        response = client.post(
            "/api/lessons/",
            json={"topic_id": "physics", "title": "Test Lesson"}
        )
        
        # Verify response
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Lesson"
        assert data["topic_id"] == "physics"
        assert "id" in data
        assert "created_at" in data
        
        # Verify streak was updated (should be 1 for first activity)
        assert test_user.current_streak == 1
        assert test_user.longest_streak == 1
        assert test_user.last_activity_date is not None
        
    finally:
        # Clean up dependency overrides
        app.dependency_overrides.clear()


def test_chat_endpoint_updates_streak(client, test_user):
    """Test that sending a message updates user streak"""
    # Set up user with existing streak
    test_user.current_streak = 2
    test_user.longest_streak = 2
    # Set last activity to yesterday so today increments streak
    test_user.last_activity_date = datetime.now(timezone.utc) - timedelta(days=1)
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    
    # Mock the lesson query to return a valid lesson
    lesson_id = str(uuid.uuid4())
    mock_lesson = MagicMock()
    mock_lesson.id = lesson_id
    mock_lesson.user_id = test_user.id
    
    # Mock the message query history (empty for first message)
    mock_message_result = MagicMock()
    mock_message_result.scalars.return_value.all.return_value = []
    
    # Override dependencies
    from app.core.database import get_db
    from app.core.security import get_current_user
    from app.models import Lesson, Message
    from sqlalchemy import select
    
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: test_user
    
    # Mock the database query results
    def mock_execute_side_effect(query):
        result_mock = MagicMock()
        query_str = str(query)
        if "SELECT lesson" in query_str and "WHERE" in query_str:
            # This is the lesson ownership check
            result_mock.scalar_one_or_none.return_value = mock_lesson
        elif "SELECT message" in query_str:
            # This is the message history query
            result_mock.scalars.return_value.all.return_value = []
        return result_mock
    
    mock_db.execute.side_effect = mock_execute_side_effect
    
    try:
        # Make request to send message
        response = client.post(
            f"/api/lessons/{lesson_id}/chat",
            json={"content": "Test message"}
        )
        
        # Verify response is successful (streaming response)
        assert response.status_code == 200
        
        # Verify streak was updated (should be 3 for consecutive day)
        assert test_user.current_streak == 3
        assert test_user.longest_streak == 3
        
    finally:
        # Clean up dependency overrides
        app.dependency_overrides.clear()


def test_same_day_activity_no_streak_change(client, test_user):
    """Test that same day activity doesn't change streak"""
    # Set up user with existing activity today
    test_user.current_streak = 2
    test_user.longest_streak = 2
    test_user.last_activity_date = datetime.now(timezone.utc)  # Today
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result
    
    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)
    mock_db.refresh.side_effect = mock_refresh
    
    # Override get_db dependency
    from app.core.database import get_db
    app.dependency_overrides[get_db] = lambda: mock_db
    
    try:
        # Make request to create lesson
        response = client.post(
            "/api/lessons/",
            json={"topic_id": "physics", "title": "Same Day Lesson"}
        )
        
        # Verify response
        assert response.status_code == 201
        
        # Verify streak was NOT changed (same day activity)
        assert test_user.current_streak == 2
        assert test_user.longest_streak == 2
        
    finally:
        # Clean up dependency overrides
        app.dependency_overrides.clear()