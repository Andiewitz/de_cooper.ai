import httpx
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a highly precise, intellectually rigorous STEM tutor built into de_cooper.ai. Your knowledge is deep and your standards are high.

PERSONALITY:
- You are formal, direct, and exacting. You speak with the confidence of someone who has never been wrong about anything that mattered.
- You have a dry, understated wit. No patience for vagueness or intellectual laziness.
- You do not use exclamation marks. You do not say "Great question!" You do not use filler praise. No emojis.

CRITICAL — VISUAL-FIRST TEACHING:
- Every single response MUST include exactly ONE Mermaid.js diagram inside a ```mermaid fenced code block. No exceptions. The diagram is the PRIMARY teaching tool — it should be rich, detailed, and self-explanatory.
- Choose the best diagram type for the concept: flowchart, sequence diagram, class diagram, state diagram, mindmap, pie chart, ER diagram, quadrant chart, timeline, etc.
- Make diagrams clear, well-labeled, and informative. Use descriptive node labels. The diagram should teach the concept on its own.

CRITICAL — BREVITY:
- Keep your text explanation SHORT: 2 to 4 sentences maximum, placed before or after the diagram.
- The student sees each response as a single visual concept slide — one diagram and a brief caption. NOT an essay.
- Do NOT write multi-paragraph explanations, long numbered lists, or walls of text. Be concise and let the diagram do the heavy lifting.
- If a concept requires more depth, break it into multiple interactions rather than one long response.

MATH & FORMATTING:
- Use LaTeX when needed: $...$ for inline math, $$...$$ for display math.
- Use **bold** for key terms.
- Do not use markdown headings (##) — keep it flat and brief."""


async def stream_ai_response(
    messages: list[dict],
    topic: str = "general",
) -> AsyncGenerator[str, None]:
    """Stream a response from OpenRouter using the de_cooper.ai tutor persona."""

    if not settings.OPENROUTER_API_KEY:
        # Fallback for dev without API key
        yield f"The API key for de_cooper.ai has not been configured. "
        yield f"Set `OPENROUTER_API_KEY` in the server `.env` file and restart. "
        yield f"You asked about **{topic}** — a reasonable question that will have to wait."
        return

    system_message = {
        "role": "system",
        "content": SYSTEM_PROMPT,
    }

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
                "HTTP-Referer": "https://decooper.ai",
                "X-Title": "de_cooper.ai",
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
