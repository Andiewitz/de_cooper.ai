import json
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Lesson, Message
from app.schemas import LessonCreate, LessonResponse, MessageCreate, MessageResponse
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

            # Check for schedule block
            import re
            match = re.search(r"```schedule-flashcards\s*([\s\S]*?)\s*```", full_response)
            if match:
                try:
                    block_data = json.loads(match.group(1).strip())
                    scheduled_date_str = block_data.get("date")
                    if scheduled_date_str:
                        # Parse target date
                        target_date = datetime.strptime(scheduled_date_str, "%Y-%m-%d").date()
                        
                        # Get user_id of the lesson
                        lesson_result = await session.execute(
                            select(Lesson).where(Lesson.id == lesson_id)
                        )
                        lesson_obj = lesson_result.scalar_one_or_none()
                        if lesson_obj:
                            # Check if calendar entry already exists for user on this date
                            from app.models import CalendarEntry
                            existing_entry = await session.execute(
                                select(CalendarEntry).where(
                                    CalendarEntry.user_id == lesson_obj.user_id,
                                    CalendarEntry.scheduled_date == target_date
                                )
                            )
                            entry_obj = existing_entry.scalar_one_or_none()
                            
                            from app.services.flashcard_service import generate_flashcards
                            if entry_obj:
                                # Overwrite existing entry's lesson and clear old cards
                                entry_obj.lesson_id = lesson_id
                                session.add(entry_obj)
                                
                                from sqlalchemy import delete
                                from app.models import Flashcard
                                await session.execute(
                                    delete(Flashcard).where(Flashcard.calendar_entry_id == entry_obj.id)
                                )
                                await session.commit()
                                
                                # Generate immediately
                                await generate_flashcards(entry_obj.id, lesson_obj.user_id, session)
                            else:
                                new_entry = CalendarEntry(
                                    user_id=lesson_obj.user_id,
                                    lesson_id=lesson_id,
                                    scheduled_date=target_date
                                )
                                session.add(new_entry)
                                await session.commit()
                                await session.refresh(new_entry)
                                
                                # Generate immediately
                                await generate_flashcards(new_entry.id, lesson_obj.user_id, session)
                except Exception:
                    # Don't break streaming response if parsing/saving fails
                    pass

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
