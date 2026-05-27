import json
import logging

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.models import CalendarEntry, Flashcard, Lesson, Message

settings = get_settings()
logger = logging.getLogger(__name__)

FLASHCARD_PROMPT = """You are a flashcard generator. Given the following lesson content, generate 5 concise flashcard pairs for study and review.

Rules:
- Each "front" should be a clear question or prompt
- Each "back" should be a concise, accurate answer
- Return ONLY a JSON array, no markdown fences, no extra text
- Format: [{"front": "...", "back": "..."}]

Lesson content:
{content}"""


async def generate_flashcards(
    calendar_entry_id: str,
    user_id: str,
    db: AsyncSession,
) -> list[Flashcard]:
    """Generate flashcards for a calendar entry's lesson content.

    Idempotent: returns existing flashcards if already generated.
    """

    # 1. Fetch calendar entry and verify ownership
    result = await db.execute(
        select(CalendarEntry).where(
            CalendarEntry.id == calendar_entry_id,
            CalendarEntry.user_id == user_id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        return None  # Caller handles 404

    # 2. Check for existing flashcards
    result = await db.execute(
        select(Flashcard).where(
            Flashcard.calendar_entry_id == calendar_entry_id,
        ).order_by(Flashcard.created_at)
    )
    existing = result.scalars().all()
    if existing:
        return list(existing)

    # 3. Fetch lesson content from messages (Sheldon's responses)
    result = await db.execute(
        select(Message).where(
            Message.lesson_id == entry.lesson_id,
            Message.role == "sheldon",
        ).order_by(Message.created_at)
    )
    messages = result.scalars().all()

    if not messages:
        # No lesson content yet — can't generate cards
        return []

    # Concatenate Sheldon's teaching content
    content = "\n\n".join(msg.content for msg in messages)

    # 4. Call OpenRouter for flashcard generation
    if not settings.OPENROUTER_API_KEY:
        logger.warning("No OPENROUTER_API_KEY set — returning empty flashcards")
        return []

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                settings.OPENROUTER_BASE_URL,
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://decooper.ai",
                    "X-Title": "de_cooper.ai",
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "user", "content": FLASHCARD_PROMPT.format(content=content[:8000])}
                    ],
                    "stream": False,
                    "temperature": 0.3,
                    "max_tokens": 2048,
                },
            )
            response.raise_for_status()
    except httpx.HTTPError as e:
        logger.error(f"OpenRouter API error during flashcard generation: {e}")
        raise RuntimeError(f"AI service unavailable: {e}")

    # 5. Parse response
    try:
        data = response.json()
        raw_content = data["choices"][0]["message"]["content"]

        # Strip markdown fences if present
        cleaned = raw_content.strip()
        if cleaned.startswith("```"):
            # Remove first and last lines (fences)
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1]).strip()

        cards_data = json.loads(cleaned)

        if not isinstance(cards_data, list):
            raise ValueError("Expected a JSON array")

    except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
        logger.error(f"Failed to parse flashcard response: {e}\nRaw: {raw_content[:500]}")
        raise RuntimeError(f"Failed to parse AI response: {e}")

    # 6. Bulk insert flashcards
    flashcards = []
    for card in cards_data:
        if not isinstance(card, dict) or "front" not in card or "back" not in card:
            continue

        fc = Flashcard(
            user_id=user_id,
            calendar_entry_id=calendar_entry_id,
            lesson_id=entry.lesson_id,
            front=card["front"],
            back=card["back"],
            metadata_json=json.dumps({
                "generated_by": "openrouter",
                "model": settings.OPENROUTER_MODEL,
            }),
        )
        db.add(fc)
        flashcards.append(fc)

    await db.commit()

    # Refresh to get server-generated fields
    for fc in flashcards:
        await db.refresh(fc)

    return flashcards
