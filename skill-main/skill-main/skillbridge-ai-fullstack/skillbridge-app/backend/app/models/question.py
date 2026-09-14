from sqlalchemy import Column, String, Text, ForeignKey
from app.database.base import Base
import uuid


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id"))
    question = Column(Text, nullable=False)
    question_type = Column(String(20), default="mcq")  # mcq | conceptual | scenario
    difficulty = Column(String(20), default="beginner")
    correct_answer = Column(Text, nullable=True)
    options_json = Column(Text, nullable=True)  # JSON-encoded list of options
