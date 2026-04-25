"""
Question Model
===============
Stores AI-generated questions for a session.
Each question belongs to one session.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # ─── Session Link ─────────────────────────────────────────────────
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)

    # ─── Question Content ─────────────────────────────────────────────
    content = Column(Text, nullable=False)
    type = Column(String(30), nullable=False)       # mcq, theory
    difficulty = Column(String(10), nullable=False) # easy, medium, hard
    options = Column(JSONB, nullable=True)          # ["A", "B", "C", "D"] for MCQ
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)

    # ─── Curriculum Mapping ───────────────────────────────────────────
    subject_id = Column(String(100), nullable=True)
    subject_name = Column(String(200), nullable=True)
    subtopic_id = Column(String(100), nullable=True)
    subtopic_name = Column(String(200), nullable=True)

    # ─── Metadata ────────────────────────────────────────────────────
    question_number = Column(Integer, nullable=True) # order in session (1, 2, 3...)
    ai_generated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="questions")
    answers = relationship("Answer", back_populates="question")