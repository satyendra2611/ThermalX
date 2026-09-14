from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.database.base import Base
import uuid


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    domain_id = Column(String(36), ForeignKey("career_domains.id"))
    assessment_type = Column(String(30), default="initial")  # initial | topic
    score = Column(Float, default=0.0)
    completed_at = Column(DateTime, default=datetime.utcnow)
