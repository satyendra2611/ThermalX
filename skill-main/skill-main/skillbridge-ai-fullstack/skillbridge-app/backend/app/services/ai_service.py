from groq import Groq

from app.core.config import get_settings

settings = get_settings()


def ask_skillbridge_ai(
    question: str,
    user_context: str | None = None,
) -> str:
    """
    Sends the user's question to Groq and returns
    a SkillBridge AI career guidance response.
    """

    if not settings.GROQ_API_KEY:
        return (
            "AI service is not configured yet. "
            "Please add GROQ_API_KEY to your .env file."
        )

    client = Groq(
        api_key=settings.GROQ_API_KEY
    )

    system_prompt = """
You are SkillBridge AI, an intelligent career guidance assistant.

Your role is to help students and learners with:

- Career guidance
- Technology career paths
- Skills they should learn
- Skill gap analysis
- Learning roadmaps
- Projects and portfolio ideas
- Interview preparation
- Resume guidance
- Technical concepts
- Placement preparation

Guidelines:

1. Be helpful, practical and encouraging.
2. Give structured answers when appropriate.
3. Keep answers easy for students to understand.
4. Recommend realistic next steps.
5. Focus on employability and skill development.
6. Do not pretend to know information that was not provided.
7. If the user asks about programming, explain with examples when useful.
8. You are specifically the AI assistant inside the SkillBridge AI platform.
"""

    if user_context:
        system_prompt += f"""

Additional learner context:
{user_context}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": question,
                },
            ],
            temperature=0.7,
            max_completion_tokens=1024,
        )

        return completion.choices[0].message.content or (
            "Sorry, I couldn't generate a response."
        )

    except Exception as error:
        print(f"[SkillBridge AI Error] {error}")

        return (
            "Sorry, SkillBridge AI is temporarily unavailable. "
            "Please try again."
        )