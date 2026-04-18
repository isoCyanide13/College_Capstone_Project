"""
Question Model
===============
Stores interview questions — MCQ, coding, theory, system design, behavioral.

Table: questions
Phase: 1 — Week 2
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    type = Column(String(30), nullable=False)  # mcq, coding, theory, system_design, behavioral
    difficulty = Column(String(10), nullable=False)  # easy, medium, hard
    topic = Column(String(100), nullable=True)
    company_tag = Column(String(100), nullable=True)
    expected_answer = Column(Text, nullable=True)
    test_cases = Column(JSONB, nullable=True)  # For coding questions
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    answers = relationship("Answer", back_populates="question")
