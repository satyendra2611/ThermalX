from pydantic import BaseModel


class RoadmapNodeOut(BaseModel):
    topicId: str
    topicName: str
    status: str
    competencyLevel: str


class RoadmapOut(BaseModel):
    userId: str
    domainId: str
    nodes: list[RoadmapNodeOut]
    updatedAt: str


class RoadmapGenerateIn(BaseModel):
    user_id: str
    domain_id: str
