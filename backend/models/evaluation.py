"""
Evaluation Model
=================
AI-generated evaluation results for submitted answers.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answers.id"), nullable=True)

    # ─── Scores ───────────────────────────────────────────────────────
    score = Column(Numeric(4, 2), nullable=True)
    is_correct = Column(Boolean, default=False)

    # ─── Feedback ─────────────────────────────────────────────────────
    feedback = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)
    strengths = Column(JSONB, nullable=True)   # list of strings
    weaknesses = Column(JSONB, nullable=True)  # list of strings

    # ─── Metadata ─────────────────────────────────────────────────────
    evaluated_by = Column(String(20), default="gemini")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    answer = relationship("Answer", back_populates="evaluation")