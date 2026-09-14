from fastapi import APIRouter
from app.schemas.assessment import AssessmentSubmitIn, AssessmentResultOut, QuestionOut
from app.services import assessment_service, ai_service

router = APIRouter(prefix="/assessment", tags=["assessment"])

# Simple in-memory result cache keyed by user id — swap for the competency_scores
# table via SQLAlchemy once persistence is wired up end-to-end.
_last_result: dict[str, dict] = {}


@router.get("/questions", response_model=list[QuestionOut])
def get_questions(domain_id: str = "web-development"):
    return [
        {
            "id": q["id"],
            "topicId": q["topicId"],
            "questionType": q["questionType"],
            "question": q["question"],
            "options": q["options"],
        }
        for q in assessment_service.DEMO_QUESTIONS
    ]


@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(payload: AssessmentSubmitIn):
    raw = [a.model_dump() for a in payload.answers]
    scored = assessment_service.score_submission(raw)
    summary = ai_service.generate_competency_summary(scored["topicScores"])
    result = {**scored, "aiSummary": summary}
    _last_result[payload.userId] = result
    return result


@router.get("/result", response_model=AssessmentResultOut)
def get_result(user_id: str):
    return _last_result.get(user_id) or {
        "overallScore": 0.0,
        "topicScores": [],
        "aiSummary": "Take your initial assessment to see your competency profile.",
    }
