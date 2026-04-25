"""
Subtopic Scores Model
======================
Granular per-user scores at subtopic level.
Used for weakness detection and ML predictions.

Example:
  user: Nairit
  subtopic_id: "dsa_dp"       → score: 3.2 (weak)
  subtopic_id: "dsa_arrays"   → score: 8.7 (strong)
  subtopic_id: "os_deadlock"  → score: 4.1 (weak)

This tells us EXACTLY where the user is weak,
not just "DSA is weak" but "Dynamic Programming is weak".
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class SubtopicScore(Base):
    __tablename__ = "subtopic_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )
    subtopic_id = Column(String(100), nullable=False)
    subtopic_name = Column(String(200), nullable=False)
    subject_id = Column(String(100), nullable=False)
    score = Column(Numeric(4, 2), default=0)
    attempts = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    avg_time_seconds = Column(Numeric(8, 2), default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="subtopic_scores")