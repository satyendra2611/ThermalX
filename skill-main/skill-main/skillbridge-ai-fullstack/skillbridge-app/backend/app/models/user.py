from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database.base import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=True)
    email = Column(String(150), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    auth_provider = Column(String(20), default="mobile")
    created_at = Column(DateTime, default=datetime.utcnow)
