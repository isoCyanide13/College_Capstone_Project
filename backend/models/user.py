"""
User Model
===========
Represents students, admins, and placement officers.

Table: users
Phase: 1 — Week 1
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # student, admin, placement_officer
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="users")
    sessions = relationship("Session", back_populates="user")
    answers = relationship("Answer", back_populates="user")
    skill_vector = relationship("SkillVector", back_populates="user", uselist=False)
    subtopic_scores = relationship("SubtopicScore", back_populates="user")
