"""
Tests for streak functionality
"""
import pytest
from datetime import datetime, timezone, timedelta
from app.models.models import User


def test_first_activity_sets_streak_to_one():
    """Test that first activity sets current streak to 1"""
    user = User()
    user.update_streak()
    
    assert user.current_streak == 1
    assert user.last_activity_date is not None
    assert user.longest_streak == 1


def test_same_day_activity_no_change():
    """Test that same day activity doesn't change streak"""
    user = User()
    user.update_streak()  # First activity
    
    # Simulate activity later same day (same date, different time)
    user.last_activity_date = datetime.now(timezone.utc)
    user.update_streak()
    
    assert user.current_streak == 1
    assert user.longest_streak == 1


def test_consecutive_day_increments_streak():
    """Test that activity on consecutive day increments streak"""
    user = User()
    user.update_streak()  # Day 1
    
    # Simulate activity next day
    user.last_activity_date = user.last_activity_date - timedelta(days=1)
    user.update_streak()
    
    assert user.current_streak == 2
    assert user.longest_streak == 2


def test_after_gap_streak_resets():
    """Test that activity after a gap resets streak to 1"""
    user = User()
    user.update_streak()  # Day 1
    
    # Simulate activity on consecutive day (Day 2)
    # We need to set last_activity_date to yesterday BEFORE calling update_streak
    user.last_activity_date = user.last_activity_date - timedelta(days=1)
    user.update_streak()  # Now current_streak should be 2
    
    # Simulate activity after 2 day gap (so last activity was 2 days ago from now)
    # Set last_activity_date to 2 days ago from now
    user.last_activity_date = user.last_activity_date - timedelta(days=2)
    user.update_streak()
    
    assert user.current_streak == 1
    assert user.longest_streak == 2  # Longest streak should remain 2


def test_longest_streak_tracking():
    """Test that longest streak is properly tracked"""
    user = User()
    
    # Day 1
    user.update_streak()
    assert user.current_streak == 1
    assert user.longest_streak == 1
    
    # Day 2
    user.last_activity_date = user.last_activity_date - timedelta(days=1)
    user.update_streak()
    assert user.current_streak == 2
    assert user.longest_streak == 2
    
    # Gap, then Day 1 again
    user.last_activity_date = user.last_activity_date - timedelta(days=2)
    user.update_streak()
    assert user.current_streak == 1
    assert user.longest_streak == 2  # Should still be 2
    
    # Build up to new longest streak
    user.last_activity_date = user.last_activity_date - timedelta(days=1)  # Day 2
    user.update_streak()
    assert user.current_streak == 2
    assert user.longest_streak == 2
    
    user.last_activity_date = user.last_activity_date - timedelta(days=1)  # Day 3
    user.update_streak()
    assert user.current_streak == 3
    assert user.longest_streak == 3  # New longest streak


def test_multiple_same_day_activities():
    """Test multiple activities on same day don't affect streak"""
    user = User()
    user.update_streak()  # First activity
    
    # Multiple activities same day
    for _ in range(5):
        user.last_activity_date = datetime.now(timezone.utc)
        user.update_streak()
    
    assert user.current_streak == 1
    assert user.longest_streak == 1