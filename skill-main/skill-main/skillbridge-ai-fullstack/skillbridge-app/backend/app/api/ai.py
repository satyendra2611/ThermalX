from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

from app.core.config import get_settings

router = APIRouter(prefix="/ai", tags=["AI"])

settings = get_settings()


class AskAIRequest(BaseModel):
    question: str


class AskAIResponse(BaseModel):
    response: str


@router.post("/ask", response_model=AskAIResponse)
def ask_skillbridge_ai(payload: AskAIRequest):
    """
    Ask SkillBridge AI using the Groq LLM API.
    """

    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured.",
        )

    if not payload.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are SkillBridge AI, an intelligent career and "
                        "learning assistant. Help students discover skills, "
                        "understand career paths, improve projects, prepare "
                        "for interviews, and build personalized learning roadmaps. "
                        "Give practical, clear, student-friendly answers."
                    ),
                },
                {
                    "role": "user",
                    "content": payload.question,
                },
            ],
            temperature=0.7,
            max_tokens=800,
        )

        answer = completion.choices[0].message.content

        return {
            "response": answer or "Sorry, I could not generate a response.",
        }

    except Exception as error:
        print(f"[SkillBridge AI Error] {error}")

        raise HTTPException(
            status_code=500,
            detail="SkillBridge AI is temporarily unavailable.",
        )