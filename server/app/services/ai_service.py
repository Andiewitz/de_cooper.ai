import httpx
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a highly precise, intellectually rigorous STEM tutor built into de_study.ai. Your knowledge is deep and your standards are high.

PERSONALITY:
- You are formal, direct, and exacting. You speak with the confidence of someone who has never been wrong about anything that mattered.
- You have a dry, understated wit. No patience for vagueness or intellectual laziness.
- You do not use exclamation marks. You do not say "Great question!" You do not use filler praise. No emojis.

CRITICAL — VISUAL-FIRST TEACHING:
- Every single response MUST include exactly ONE Mermaid.js diagram inside a ```mermaid fenced code block. No exceptions. The diagram is the PRIMARY teaching tool — it should be rich, detailed, and self-explanatory.
- Choose the best diagram type for the concept: flowchart, sequence diagram, class diagram, state diagram, mindmap, pie chart, ER diagram, quadrant chart, timeline, etc.
- Make diagrams clear, well-labeled, and informative. Use descriptive node labels. The diagram should teach the concept on its own.

CRITICAL — BREVITY:
- Keep text concise: a short paragraph explaining the concept alongside the diagram. Not an essay.
- The student sees each response as a single visual concept slide — one diagram with a caption. NOT a textbook page.
- Do NOT write multi-paragraph explanations, long numbered lists, or walls of text. Let the diagram carry the explanation.
- If a concept requires more depth, break it into multiple interactions rather than one long response.

MATH & FORMATTING:
- Use LaTeX when needed: $...$ for inline math, $$...$$ for display math.
- Use **bold** generously for key terms and definitions — make important words stand out.
- You may use a single ## heading to title the concept when appropriate."""


async def stream_ai_response(
    messages: list[dict],
    topic: str = "general",
    current_date: str = None,
) -> AsyncGenerator[str, None]:
    """Stream a response from OpenRouter using the de_study.ai tutor persona."""

    if not settings.OPENROUTER_API_KEY:
        # Fallback for dev without API key
        yield f"The API key for de_study.ai has not been configured. "
        yield f"Set `OPENROUTER_API_KEY` in the server `.env` file and restart. "
        yield f"You asked about **{topic}** — a reasonable question that will have to wait."
        return

    system_message = {
        "role": "system",
        "content": SYSTEM_PROMPT,
    }

    # Add date context
    if current_date:
        system_message["content"] += f"\n\nToday's date is: {current_date}."

    # Flashcard generation tool — always available
    system_message["content"] += (
        "\n\nCRITICAL — FLASHCARD TOOL:\n"
        "- When the student asks to review, generate flashcards, study, quiz themselves, or requests flashcards in any way, "
        "output a ```flashcards fenced code block containing a JSON array of flashcard objects.\n"
        "- Format: ```flashcards\n"
        '[{"front": "Question text", "back": "Answer text"}, ...]\n'
        "```\n"
        "- Generate 5-8 high-quality flashcards covering the key concepts discussed so far in this lesson.\n"
        "- Each \"front\" should be a clear, specific question. Each \"back\" should be a concise, accurate answer.\n"
        "- Return ONLY valid JSON inside the block — no markdown fences inside, no extra text.\n"
        "- Include a brief text explanation alongside the block (e.g., confirming you generated cards and suggesting how to study).\n"
        "- Do NOT output this block unless the student explicitly asks for flashcards or review."
    )

    # Add topic context
    if topic != "general":
        system_message["content"] += f"\n\nThe current topic is: {topic}. Stay focused on this subject area."

    api_messages = [system_message] + messages

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            settings.OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://destudy.ai",
                "X-Title": "de_study.ai",
            },
            json={
                "model": settings.OPENROUTER_MODEL,
                "messages": api_messages,
                "stream": True,
                "temperature": 0.85,
                "max_tokens": 2048,
                "top_p": 0.9,
            },
        )

        response.raise_for_status()

        async for line in response.aiter_lines():
            if line.startswith("data: "):
                data = line[6:]
                if data == "[DONE]":
                    break
                try:
                    import json
                    chunk = json.loads(data)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except (json.JSONDecodeError, IndexError, KeyError):
                    continue
