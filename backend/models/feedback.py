"""
Session Feedback Model
=======================
Stores user feedback after each session.
Used to improve question quality and prompt generation.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class SessionFeedback(Base):
    __tablename__ = "session_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Ratings
    overall_rating = Column(Integer, nullable=False)        # 1-5 stars
    difficulty_appropriate = Column(Boolean, nullable=True) # was difficulty right?
    questions_relevant = Column(Boolean, nullable=True)     # were questions relevant?

    # Open text
    comments = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")