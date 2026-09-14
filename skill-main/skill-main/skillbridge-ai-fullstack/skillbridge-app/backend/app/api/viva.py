import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from app.services import ai_service

router = APIRouter(prefix="/viva", tags=["viva"])

_sessions: dict[str, dict] = {}


class StartIn(BaseModel):
    project_id: str


class RespondIn(BaseModel):
    session_id: str
    answer: str


@router.post("/start")
def start_viva(payload: StartIn):
    session_id = str(uuid.uuid4())
    question = ai_service.generate_viva_question(payload.project_id, [])
    _sessions[session_id] = {"project_id": payload.project_id, "turns": [], "question": question}
    return {"sessionId": session_id, "question": question}


@router.post("/respond")
def respond(payload: RespondIn):
    session = _sessions.setdefault(payload.session_id, {"project_id": "unknown", "turns": [], "question": ""})
    evaluation = ai_service.evaluate_response(session["question"], payload.answer)
    session["turns"].append({"question": session["question"], "answer": payload.answer, "score": evaluation["score"]})

    if len(session["turns"]) >= 3:
        return {"done": True, "feedback": "Your viva is complete."}

    next_question = ai_service.generate_viva_question(session["project_id"], session["turns"])
    session["question"] = next_question
    return {"done": False, "question": next_question}


@router.get("/result")
def result(session_id: str):
    session = _sessions.get(session_id, {"turns": []})
    turns = session["turns"]
    if not turns:
        return {"technicalScore": 0, "understandingScore": 0, "communicationScore": 0, "finalScore": 0, "feedback": ""}
    avg = sum(t["score"] for t in turns) / len(turns)
    return {
        "technicalScore": round(avg, 1),
        "understandingScore": round(avg * 0.95, 1),
        "communicationScore": round(avg * 1.05, 1),
        "finalScore": round(avg, 1),
        "feedback": "Solid grasp of your own project — keep connecting decisions back to trade-offs.",
    }
