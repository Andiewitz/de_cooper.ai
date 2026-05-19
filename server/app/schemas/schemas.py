import uuid
from datetime import datetime
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
    created_at: datetime

    model_config = {"from_attributes": True}


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
