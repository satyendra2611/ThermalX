from pydantic import BaseModel


class QuestionOut(BaseModel):
    id: str
    topicId: str
    questionType: str
    question: str
    options: list[str] | None = None


class AnswerIn(BaseModel):
    questionId: str
    answer: str


class AssessmentSubmitIn(BaseModel):
    userId: str
    domainId: str
    answers: list[AnswerIn]


class TopicScoreOut(BaseModel):
    topicId: str
    topicName: str
    score: float
    level: str


class AssessmentResultOut(BaseModel):
    overallScore: float
    topicScores: list[TopicScoreOut]
    aiSummary: str
