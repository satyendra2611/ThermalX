from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.database.base import Base
import uuid


class CompetencyScore(Base):
    __tablename__ = "competency_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    topic_id = Column(String(36), ForeignKey("topics.id"))
    score = Column(Float, default=0.0)
    level = Column(String(20), default="needs_focus")  # strong | developing | needs_focus
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
