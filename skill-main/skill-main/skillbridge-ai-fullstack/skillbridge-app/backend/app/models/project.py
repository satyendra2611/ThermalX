from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from app.database.base import Base
import uuid


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id"))
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), default="beginner")


class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    project_id = Column(String(36), ForeignKey("projects.id"))
    file_url = Column(String(255), nullable=True)
    submission_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="submitted")
    score = Column(Float, nullable=True)
