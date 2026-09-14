from sqlalchemy import Column, String, Text, Float, ForeignKey
from app.database.base import Base
import uuid


class ModificationChallenge(Base):
    __tablename__ = "modification_challenges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    project_id = Column(String(36), ForeignKey("projects.id"))
    challenge = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending | submitted | evaluated
    score = Column(Float, nullable=True)
