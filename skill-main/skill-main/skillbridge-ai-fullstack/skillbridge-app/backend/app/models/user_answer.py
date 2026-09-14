from sqlalchemy import Column, String, Float, Text, ForeignKey
from app.database.base import Base
import uuid


class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    question_id = Column(String(36), ForeignKey("questions.id"))
    answer = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
