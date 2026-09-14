from sqlalchemy import Column, String, Text, Integer, ForeignKey
from app.database.base import Base
import uuid


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain_id = Column(String(36), ForeignKey("career_domains.id"))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    difficulty_level = Column(Integer, default=1)
