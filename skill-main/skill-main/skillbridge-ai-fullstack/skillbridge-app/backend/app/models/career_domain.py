from sqlalchemy import Column, String, Text
from app.database.base import Base
import uuid


class CareerDomain(Base):
    __tablename__ = "career_domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    status = Column(String(20), default="coming_soon")  # active | coming_soon
    description = Column(Text, nullable=True)
    icon = Column(String(10), default="🎯")
