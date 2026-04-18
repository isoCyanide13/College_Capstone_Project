"""
Cheat Event Model
==================
Logs anti-cheat events — tab switches, gaze away, face missing, multiple faces.

Table: cheat_events
Phase: 4 — Week 16
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class CheatEvent(Base):
    __tablename__ = "cheat_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # tab_switch, gaze_away, face_missing, multiple_faces
    severity = Column(String(10), nullable=False)  # low, medium, high
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_metadata = Column(JSONB, nullable=True)

    # Relationships
    session = relationship("Session", back_populates="cheat_events")
