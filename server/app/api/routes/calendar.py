import json
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Lesson, CalendarEntry, Flashcard
from app.schemas import (
    CalendarEntryCreate,
    CalendarEntryResponse,
    FlashcardResponse,
    CalendarDayResponse,
    LessonResponse,
)
from app.services.flashcard_service import generate_flashcards

router = APIRouter(prefix="/calendar", tags=["calendar"])


def _entry_to_response(entry: CalendarEntry) -> CalendarEntryResponse:
    """Convert a CalendarEntry ORM object to its response schema."""
    return CalendarEntryResponse(
        id=entry.id,
        user_id=entry.user_id,
        lesson_id=entry.lesson_id,
        scheduled_date=entry.scheduled_date,
        created_at=entry.created_at,
        lesson_title=entry.lesson.title if entry.lesson else None,
        lesson_topic_id=entry.lesson.topic_id if entry.lesson else None,
    )


def _flashcard_to_response(fc: Flashcard) -> FlashcardResponse:
    """Convert a Flashcard ORM object to its response schema."""
    metadata = {}
    if fc.metadata_json:
        try:
            metadata = json.loads(fc.metadata_json)
        except (json.JSONDecodeError, TypeError):
            pass

    return FlashcardResponse(
        id=fc.id,
        front=fc.front,
        back=fc.back,
        metadata=metadata,
        created_at=fc.created_at,
    )


@router.post("/", response_model=CalendarEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_calendar_entry(
    data: CalendarEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Assign a lesson to a specific date on the calendar."""

    # Verify the lesson exists and belongs to user
    result = await db.execute(
        select(Lesson).where(Lesson.id == data.lesson_id, Lesson.user_id == current_user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    entry = CalendarEntry(
        user_id=current_user.id,
        lesson_id=data.lesson_id,
        scheduled_date=data.scheduled_date,
    )
    db.add(entry)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lesson is already scheduled for this date.",
        )

    await db.refresh(entry)

    # Eagerly load the lesson relationship for the response
    result = await db.execute(
        select(CalendarEntry)
        .where(CalendarEntry.id == entry.id)
        .join(CalendarEntry.lesson)
    )
    entry = result.scalar_one()

    return _entry_to_response(entry)


@router.get("/", response_model=list[CalendarEntryResponse])
async def get_calendar_entries(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$", description="Month in YYYY-MM format"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all calendar entries for a given month, scoped to the authenticated user."""

    year, month_num = map(int, month.split("-"))

    result = await db.execute(
        select(CalendarEntry)
        .join(CalendarEntry.lesson)
        .where(
            CalendarEntry.user_id == current_user.id,
            extract("year", CalendarEntry.scheduled_date) == year,
            extract("month", CalendarEntry.scheduled_date) == month_num,
        )
        .order_by(CalendarEntry.scheduled_date)
    )
    entries = result.scalars().all()

    return [_entry_to_response(e) for e in entries]


@router.get("/{date}/flashcards", response_model=CalendarDayResponse)
async def get_day_flashcards(
    date: date,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lesson + flashcards for a given date. Auto-generates flashcards if they don't exist."""

    # Find the calendar entry for this date
    result = await db.execute(
        select(CalendarEntry)
        .join(CalendarEntry.lesson)
        .where(
            CalendarEntry.user_id == current_user.id,
            CalendarEntry.scheduled_date == date,
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="No lesson scheduled for this date.")

    # Check for existing flashcards
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.calendar_entry_id == entry.id)
        .order_by(Flashcard.created_at)
    )
    flashcards = list(result.scalars().all())

    # Auto-generate if none exist
    if not flashcards:
        try:
            flashcards = await generate_flashcards(entry.id, current_user.id, db)
        except RuntimeError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Couldn't generate flashcards: {str(e)}",
            )

    return CalendarDayResponse(
        date=date,
        lesson=LessonResponse(
            id=entry.lesson.id,
            topic_id=entry.lesson.topic_id,
            title=entry.lesson.title,
            created_at=entry.lesson.created_at,
        ),
        flashcards=[_flashcard_to_response(fc) for fc in flashcards],
    )


@router.delete("/{date}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calendar_entry(
    date: date,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a calendar entry (and its flashcards via cascade) for a given date."""

    result = await db.execute(
        select(CalendarEntry).where(
            CalendarEntry.user_id == current_user.id,
            CalendarEntry.scheduled_date == date,
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="No entry found for this date.")

    await db.delete(entry)
    await db.commit()
