"""
Session Model
==============
Represents a question practice session.
Stores config, progress, and final results.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # ─── Session Type & Status ────────────────────────────────────────
    session_type = Column(String(30), nullable=False, default="topic_practice")
    status = Column(String(20), default="active")  # active, completed, aborted

    # ─── Session Configuration ────────────────────────────────────────
    domain_id = Column(String(100), nullable=True)
    subject_id = Column(String(100), nullable=True)
    subject_name = Column(String(200), nullable=True)
    skill_field = Column(String(100), nullable=True)
    subtopics = Column(JSONB, nullable=True)      # list of {id, name}
    difficulty = Column(String(20), nullable=True)
    question_type = Column(String(20), nullable=True)  # mcq, theory, mixed
    question_count = Column(Integer, nullable=True)

    # ─── Results (filled after session ends) ─────────────────────────
    total_score = Column(Numeric(4, 2), nullable=True)
    accuracy = Column(Numeric(5, 2), nullable=True)
    total_time_seconds = Column(Integer, nullable=True)
    weak_subtopics = Column(JSONB, nullable=True)    # [{subtopic, score, feedback}]
    strong_subtopics = Column(JSONB, nullable=True)  # [subtopic_name, ...]
    session_summary = Column(JSONB, nullable=True)   # full compact summary

    # ─── Timestamps ──────────────────────────────────────────────────
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ─── Anti-cheat ──────────────────────────────────────────────────
    cheat_flags = Column(JSONB, default=[])

    # Relationships
    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session")
    answers = relationship("Answer", back_populates="session")
    cheat_events = relationship("CheatEvent", back_populates="session")
    conversation_logs = relationship("ConversationLog", back_populates="session")