#!/usr/bin/env python3

"""
Debug script to test streak logic
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from datetime import datetime, timezone, timedelta
from app.models.models import User

def debug_streak_logic():
    print("=== Debugging Streak Logic ===")
    
    # Create a new user
    user = User()
    print(f"Initial state: current_streak={user.current_streak}, longest_streak={user.longest_streak}, last_activity_date={user.last_activity_date}")
    
    # Simulate Day 1 activity
    print("\n--- Day 1 Activity ---")
    user.update_streak()
    print(f"After update: current_streak={user.current_streak}, longest_streak={user.longest_streak}, last_activity_date={user.last_activity_date}")
    
    # Simulate Day 2 activity (consecutive day)
    print("\n--- Day 2 Activity ---")
    # Set last_activity_date to yesterday
    user.last_activity_date = user.last_activity_date - timedelta(days=1)
    print(f"Before update (set to yesterday): last_activity_date={user.last_activity_date}")
    user.update_streak()
    print(f"After update: current_streak={user.current_streak}, longest_streak={user.longest_streak}, last_activity_date={user.last_activity_date}")
    
    # Simulate activity after 2-day gap
    print("\n--- Activity After 2-Day Gap ---")
    # Set last_activity_date to 2 days ago (from the current last_activity_date)
    user.last_activity_date = user.last_activity_date - timedelta(days=2)
    print(f"Before update (set to 2 days ago): last_activity_date={user.last_activity_date}")
    user.update_streak()
    print(f"After update: current_streak={user.current_streak}, longest_streak={user.longest_streak}, last_activity_date={user.last_activity_date}")
    
    print(f"\nResult: current_streak={user.current_streak} (expected: 1)")
    print(f"Result: longest_streak={user.longest_streak} (expected: 2)")
    
    if user.current_streak == 1 and user.longest_streak == 2:
        print("Test PASSED")
    else:
        print("Test FAILED")

if __name__ == "__main__":
    debug_streak_logic()