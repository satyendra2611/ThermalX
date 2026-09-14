from pydantic import BaseModel


class ReadinessCalculateIn(BaseModel):
    user_id: str


class ContributorOut(BaseModel):
    label: str
    impact: float


class JobReadinessOut(BaseModel):
    readinessScore: float
    status: str
    positiveContributors: list[ContributorOut]
    improvementFactors: list[ContributorOut]
    recommendedNextSteps: list[str]
