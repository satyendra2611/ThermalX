from sqlalchemy import Column, String, Integer, ForeignKey
from app.database.base import Base
import uuid


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    topic_id = Column(String(36), ForeignKey("topics.id"))
    status = Column(String(20), default="upcoming")  # completed | current | priority | upcoming | locked
    priority = Column(Integer, default=0)
