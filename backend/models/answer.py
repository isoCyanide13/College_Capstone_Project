"""
Answer Model
=============
Stores student responses — text, code, and voice transcripts.

Table: answers
Phase: 1 — Week 4
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    response_text = Column(Text, nullable=True)
    response_code = Column(Text, nullable=True)
    voice_transcript = Column(Text, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    user = relationship("User", back_populates="answers")
    evaluation = relationship("Evaluation", back_populates="answer", uselist=False)
