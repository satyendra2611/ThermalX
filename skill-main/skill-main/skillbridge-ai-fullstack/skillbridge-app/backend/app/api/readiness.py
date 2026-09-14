from fastapi import APIRouter
from app.schemas.readiness import ReadinessCalculateIn, JobReadinessOut
from app.services import readiness_service
from app.api.assessment import _last_result

router = APIRouter(prefix="/readiness", tags=["readiness"])


def _gather_features(user_id: str) -> dict:
    """
    Pulls the measurable performance signals defined in the TRD's feature list.
    In this MVP, project/viva/interview scores aren't yet persisted per-user, so
    sensible demo defaults are used when a stage hasn't been completed — replace
    with real lookups against project_submissions / viva_results / mock_interviews
    once those flows are wired to the database.
    """
    assessment = _last_result.get(user_id)
    topic_assessment_score = assessment["overallScore"] if assessment else 65.0

    return {
        "topic_assessment_score": topic_assessment_score,
        "project_completion_score": 82.0,
        "project_understanding_score": 78.0,
        "viva_score": 75.0,
        "modification_score": 70.0,
        "mock_interview_score": 68.0,
    }


@router.post("/calculate", response_model=JobReadinessOut)
def calculate_readiness(payload: ReadinessCalculateIn):
    features = _gather_features(payload.user_id)
    return readiness_service.build_report(features)


@router.get("/{user_id}", response_model=JobReadinessOut)
def get_readiness(user_id: str):
    features = _gather_features(user_id)
    return readiness_service.build_report(features)
