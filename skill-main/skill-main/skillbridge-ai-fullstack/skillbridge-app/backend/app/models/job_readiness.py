from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from app.database.base import Base
import uuid


class JobReadiness(Base):
    __tablename__ = "job_readiness"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    assessment_score = Column(Float, default=0.0)
    project_score = Column(Float, default=0.0)
    viva_score = Column(Float, default=0.0)
    modification_score = Column(Float, default=0.0)
    interview_score = Column(Float, default=0.0)
    readiness_score = Column(Float, default=0.0)
    report_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
