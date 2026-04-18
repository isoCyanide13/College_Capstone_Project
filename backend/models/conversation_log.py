"""
Conversation Log Model
=======================
Stores the full conversation between AI interviewers and candidates.

Table: conversation_logs
Phase: 3 — Week 11
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class ConversationLog(Base):
    __tablename__ = "conversation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    speaker = Column(String(20), nullable=False)  # interviewer_1, interviewer_2, interviewer_3, candidate
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sequence_number = Column(Integer, nullable=True)

    # Relationships
    session = relationship("Session", back_populates="conversation_logs")
