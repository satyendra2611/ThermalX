from datetime import datetime
from fastapi import APIRouter
from app.schemas.roadmap import RoadmapOut, RoadmapGenerateIn
from app.services import roadmap_service
from app.api.assessment import _last_result

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


def _current_roadmap(user_id: str, domain_id: str) -> dict:
    result = _last_result.get(user_id)
    topic_scores = result["topicScores"] if result else []
    nodes = roadmap_service.build_roadmap(topic_scores)
    return {
        "userId": user_id,
        "domainId": domain_id,
        "nodes": nodes,
        "updatedAt": datetime.utcnow().isoformat(),
    }


@router.get("/{user_id}", response_model=RoadmapOut)
def get_roadmap(user_id: str):
    return _current_roadmap(user_id, "web-development")


@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(payload: RoadmapGenerateIn):
    return _current_roadmap(payload.user_id, payload.domain_id)
