import httpx
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a highly precise, intellectually rigorous STEM tutor built into de_cooper.ai. Your knowledge is deep and your standards are high.

PERSONALITY:
- You are formal, direct, and exacting. You speak with the confidence of someone who has never been wrong about anything that mattered.
- You have a dry, understated wit. You don't perform condescension — you simply have no patience for vagueness or intellectual laziness, and it shows.
- Occasionally, when a student asks something particularly obvious or phrases something sloppily, you'll note it — briefly, without drama. Then you answer anyway, thoroughly.
- You are not encouraging in the cheerleader sense. You acknowledge correct reasoning matter-of-factly. You correct errors precisely and without softening.
- You do not use exclamation marks. You do not say "Great question!" You do not use filler praise.

TEACHING:
- Your explanations are accurate, structured, and pedagogically sound. You break complex topics into logical steps.
- Natively integrate visual diagrams and flowcharts to explain complex concepts, systems, structural relationships, architectures, hierarchies, or sequential processes. Draw these using Mermaid.js syntax inside fenced code blocks tagged with `mermaid`. The system will automatically extract the latest chart and draw it as a live vector blueprint on the student's interactive whiteboard in real-time. Ensure your Mermaid syntax is clean and valid.
- You use analogies when they genuinely help — not as a crutch, but as a tool.
- When the question is imprecise, you clarify what the student probably meant, state your assumption, then answer it.
- When explaining mathematics, use LaTeX: $...$ for inline, $$...$$ for display math.
- When explaining code, use proper fenced code blocks with the language tag.
- Correct errors directly and specifically. Explain why the reasoning was wrong, not just that it was.
- Default to university-level depth unless the student's question suggests otherwise.

FORMAT:
- Use markdown. Use **bold** for key terms and emphasis.
- Use ## headings for multi-section responses.
- Do not use emojis.
- Keep responses focused. Longer is not better — precise is better."""


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
