import json
import re
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Lesson, Message, Flashcard
from app.schemas import LessonCreate, LessonResponse, MessageCreate, MessageResponse, FlashcardResponse
from app.services.ai_service import stream_ai_response

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    data: LessonCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new lesson. Another student who thinks they can learn. How quaint."""
    # Update user streak
    current_user.update_streak()
    
    # Check if a lesson with this topic_id already exists for the user
    result = await db.execute(
        select(Lesson).where(
            Lesson.user_id == current_user.id,
            Lesson.topic_id == data.topic_id
        )
    )
    existing_lesson = result.scalar_one_or_none()
    if existing_lesson:
        return existing_lesson
    
    lesson = Lesson(
        user_id=current_user.id,
        topic_id=data.topic_id,
        title=data.title,
    )
    db.add(lesson)
    from sqlalchemy.exc import IntegrityError
    try:
        await db.commit()
        await db.refresh(lesson)
        return lesson
    except IntegrityError:
        await db.rollback()
        # Fetch the existing lesson that won the race
        result = await db.execute(
            select(Lesson).where(
                Lesson.user_id == current_user.id,
                Lesson.topic_id == data.topic_id
            )
        )
        existing_lesson = result.scalar_one_or_none()
        if existing_lesson:
            return existing_lesson
        raise


@router.get("/", response_model=list[LessonResponse])
async def get_lessons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all lessons for the current user."""
    result = await db.execute(
        select(Lesson)
        .where(Lesson.user_id == current_user.id)
        .order_by(Lesson.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific lesson."""
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == current_user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found. Much like your attention span.")
    return lesson


@router.get("/{lesson_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages for a lesson."""
    # Verify lesson belongs to user
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lesson not found.")

    result = await db.execute(
        select(Message)
        .where(Message.lesson_id == lesson_id)
        .order_by(Message.created_at)
    )
    return result.scalars().all()


@router.get("/{lesson_id}/flashcards")
async def get_lesson_flashcards(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all flashcards for a lesson."""
    # Verify lesson belongs to user
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lesson not found.")

    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.lesson_id == lesson_id, Flashcard.user_id == current_user.id)
        .order_by(Flashcard.created_at)
    )
    flashcards = result.scalars().all()

    response_cards = []
    for fc in flashcards:
        metadata = {}
        if fc.metadata_json:
            try:
                metadata = json.loads(fc.metadata_json)
            except (json.JSONDecodeError, TypeError):
                pass
        response_cards.append(FlashcardResponse(
            id=fc.id,
            front=fc.front,
            back=fc.back,
            metadata=metadata,
            created_at=fc.created_at,
        ))

    return response_cards


@router.post("/{lesson_id}/chat")
async def chat(
    lesson_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get a streamed response from Dr. Cooper."""
    
    # Update user streak
    current_user.update_streak()

    # Verify lesson belongs to user
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == current_user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    # Save the student's message
    student_msg = Message(
        lesson_id=lesson_id,
        role="student",
        content=data.content,
    )
    db.add(student_msg)
    await db.commit()

    # Get conversation history
    result = await db.execute(
        select(Message)
        .where(Message.lesson_id == lesson_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    # Build messages for AI
    ai_messages = []
    for msg in history:
        ai_messages.append({
            "role": "user" if msg.role == "student" else "assistant",
            "content": msg.content,
        })

    # Stream the response
    async def generate():
        full_response = ""
        from datetime import datetime, timezone
        current_date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        async for chunk in stream_ai_response(ai_messages, topic=lesson.topic_id, current_date=current_date_str):
            full_response += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # Save Sheldon's full response using a new database session
        from app.core.database import async_session_factory
        
        async with async_session_factory() as session:
            sheldon_msg = Message(
                lesson_id=lesson_id,
                role="sheldon",
                content=full_response,
            )
            session.add(sheldon_msg)
            await session.commit()

            # Detect ```flashcards blocks and save them
            flashcard_match = re.search(r"```flashcards\s*([\s\S]*?)\s*```", full_response)
            if flashcard_match:
                try:
                    raw_json = flashcard_match.group(1).strip()
                    cards_data = json.loads(raw_json)

                    if isinstance(cards_data, list):
                        for card in cards_data:
                            if isinstance(card, dict) and "front" in card and "back" in card:
                                fc = Flashcard(
                                    user_id=current_user.id,
                                    lesson_id=lesson_id,
                                    calendar_entry_id=None,
                                    front=card["front"],
                                    back=card["back"],
                                    metadata_json=json.dumps({
                                        "generated_by": "ai_inline",
                                        "source": "chat",
                                    }),
                                )
                                session.add(fc)
                        await session.commit()
                except Exception as e:
                    # Don't break streaming if flashcard parsing/saving fails
                    import logging
                    logging.getLogger(__name__).error(f"Failed to save flashcards: {e}")

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )



