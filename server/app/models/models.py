import uuid
from datetime import datetime, timezone, timedelta, date

from sqlalchemy import String, DateTime, Date, func, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    username: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Onboarding Baseline
    age: Mapped[int | None] = mapped_column(nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    onboarding_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(default=False, server_default="false")
    
    # Streak Tracking
    last_activity_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_streak: Mapped[int] = mapped_column(default=0)
    longest_streak: Mapped[int] = mapped_column(default=0)
    academic_elo: Mapped[int] = mapped_column(default=500)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.username}>"

    def update_streak(self) -> "User":
        """Update streak based on last activity date"""
        now = datetime.now(timezone.utc)
        
        if self.last_activity_date is None:
            # First activity
            self.current_streak = 1
            self.last_activity_date = now
        else:
            # Convert to date for comparison (ignoring time)
            last_activity_date_only = self.last_activity_date.date()
            now_date_only = now.date()
            yesterday_date_only = (now - timedelta(days=1)).date()
            
            if last_activity_date_only == now_date_only:
                # Same day activity - no change to streak
                pass
            elif last_activity_date_only == yesterday_date_only:
                # Yesterday activity - increment streak
                self.current_streak += 1
                self.last_activity_date = now
            else:
                # More than 1 day gap - reset streak
                self.current_streak = 1
                self.last_activity_date = now
        
        # Update longest streak if current streak is greater
        # Handle case where longest_streak might be None
        longest_streak = self.longest_streak if self.longest_streak is not None else 0
        if self.current_streak > longest_streak:
            self.longest_streak = self.current_streak
            
        return self


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    topic_id: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="lessons")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan", order_by="Message.created_at"
    )
    flashcards: Mapped[list["Flashcard"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan", order_by="Flashcard.created_at",
        foreign_keys="Flashcard.lesson_id",
    )

    def __repr__(self) -> str:
        return f"<Lesson {self.title}>"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    lesson_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False  # "assistant" | "student" | legacy: "sheldon"
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    lesson: Mapped["Lesson"] = relationship(back_populates="messages")

    def __repr__(self) -> str:
        return f"<Message {self.role}: {self.content[:50]}>"


class CalendarEntry(Base):
    __tablename__ = "calendar_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "scheduled_date", name="uq_user_scheduled_date"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    lesson_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False
    )
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship()
    lesson: Mapped["Lesson"] = relationship()
    flashcards: Mapped[list["Flashcard"]] = relationship(
        back_populates="calendar_entry", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CalendarEntry {self.scheduled_date} lesson={self.lesson_id}>"


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    calendar_entry_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("calendar_entries.id", ondelete="CASCADE"), nullable=True
    )
    lesson_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lessons.id"), nullable=False
    )
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True, default="{}")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship()
    calendar_entry: Mapped["CalendarEntry"] = relationship(back_populates="flashcards")
    lesson: Mapped["Lesson"] = relationship()

    def __repr__(self) -> str:
        return f"<Flashcard {self.front[:40]}>"
