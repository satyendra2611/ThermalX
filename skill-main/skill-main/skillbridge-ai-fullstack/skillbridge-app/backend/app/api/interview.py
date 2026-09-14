import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from app.services import ai_service

router = APIRouter(prefix="/interview", tags=["interview"])

QUESTIONS = [
    "Explain the difference between var, let and const.",
    "How would you center a div both horizontally and vertically?",
    "What is a JavaScript closure, and where might you use one?",
    "How does React decide when to re-render a component?",
]

_sessions: dict[str, dict] = {}


class StartIn(BaseModel):
    user_id: str
    domain_id: str


class RespondIn(BaseModel):
    session_id: str
    answer: str


@router.post("/start")
def start_interview(payload: StartIn):
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {"index": 0, "scores": []}
    return {"sessionId": session_id, "question": QUESTIONS[0], "totalQuestions": len(QUESTIONS)}


@router.post("/respond")
def respond(payload: RespondIn):
    session = _sessions.setdefault(payload.session_id, {"index": 0, "scores": []})
    evaluation = ai_service.evaluate_response(QUESTIONS[session["index"]], payload.answer)
    session["scores"].append(evaluation["score"])
    session["index"] += 1

    if session["index"] >= len(QUESTIONS):
        return {"done": True}
    return {"done": False, "question": QUESTIONS[session["index"]]}


@router.get("/result")
def result(session_id: str):
    session = _sessions.get(session_id, {"scores": []})
    scores = session["scores"] or [0]
    avg = sum(scores) / len(scores)
    return {
        "technicalScore": round(avg, 1),
        "problemSolvingScore": round(avg * 0.9, 1),
        "communicationScore": round(avg * 1.05, 1),
        "projectUnderstandingScore": round(avg * 0.95, 1),
        "finalScore": round(avg, 1),
    }
