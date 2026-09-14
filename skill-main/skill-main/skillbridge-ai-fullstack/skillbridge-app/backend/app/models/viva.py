from sqlalchemy import Column, String, Float, Text, ForeignKey
from app.database.base import Base
import uuid


class VivaResult(Base):
    __tablename__ = "viva_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    project_id = Column(String(36), ForeignKey("projects.id"))
    technical_score = Column(Float, default=0.0)
    understanding_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
