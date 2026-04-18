"""
Evaluation Model
=================
AI-generated evaluation results for submitted answers.

Table: evaluations
Phase: 1 — Week 4
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answers.id"), nullable=False)
    score = Column(Numeric(4, 2), nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    model_answer = Column(Text, nullable=True)
    code_result = Column(JSONB, nullable=True)  # test case pass/fail, runtime, memory
    evaluated_by = Column(String(20), nullable=False, default="gemini")  # gemini, judge0, hybrid
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    answer = relationship("Answer", back_populates="evaluation")
