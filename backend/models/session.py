"""
Session Model
==============
Represents an interview session — full test, custom, AI interview, or mock panel.

Table: sessions
Phase: 1 — Week 3
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_type = Column(String(30), nullable=False)  # full_test, custom, ai_interview, mock_panel
    status = Column(String(20), default="scheduled")  # scheduled, active, completed, aborted
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    cheat_flags = Column(JSONB, default=[])
    recording_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="sessions")
    answers = relationship("Answer", back_populates="session")
    cheat_events = relationship("CheatEvent", back_populates="session")
    conversation_logs = relationship("ConversationLog", back_populates="session")
