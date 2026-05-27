import uuid
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field


# --- Auth Schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(None, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str | None = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    display_name: str | None
    avatar_url: str | None = None
    age: int | None = None
    occupation: str | None = None
    onboarding_reason: str | None = None
    onboarding_completed: bool
    created_at: datetime
    last_activity_date: datetime | None = None
    current_streak: int = 0
    longest_streak: int = 0

    model_config = {"from_attributes": True}


class UserOnboardingUpdate(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=255)
    age: int = Field(..., ge=1, le=120)
    occupation: str = Field(..., min_length=1, max_length=255)
    onboarding_reason: str = Field(..., min_length=1)



class GoogleLoginRequest(BaseModel):
    credential: str


# --- Lesson Schemas ---

class LessonCreate(BaseModel):
    topic_id: str
    title: str


class LessonResponse(BaseModel):
    id: uuid.UUID
    topic_id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Calendar Schemas ---

class CalendarEntryCreate(BaseModel):
    lesson_id: str
    scheduled_date: date


class CalendarEntryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    lesson_id: uuid.UUID
    scheduled_date: date
    created_at: datetime
    lesson_title: str | None = None
    lesson_topic_id: str | None = None

    model_config = {"from_attributes": True}


# --- Flashcard Schemas ---

class FlashcardResponse(BaseModel):
    id: uuid.UUID
    front: str
    back: str
    metadata: dict = {}
    created_at: datetime

    model_config = {"from_attributes": True}


class FlashcardGenerateRequest(BaseModel):
    calendar_entry_id: str


class CalendarDayResponse(BaseModel):
    date: date
    lesson: LessonResponse
    flashcards: list[FlashcardResponse]
