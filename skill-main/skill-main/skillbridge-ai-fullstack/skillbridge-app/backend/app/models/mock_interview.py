from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.database.base import Base
import uuid


class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    domain_id = Column(String(36), ForeignKey("career_domains.id"))
    technical_score = Column(Float, default=0.0)
    problem_solving_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
