"""
Skill Vector Model
===================
Per-user skill scores across multiple topics — updated after every session.

Table: skill_vectors
Phase: 5 — Week 17
Status: 🔲 Not Started
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class SkillVector(Base):
    __tablename__ = "skill_vectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    arrays = Column(Numeric(4, 2), default=0)
    linked_lists = Column(Numeric(4, 2), default=0)
    trees = Column(Numeric(4, 2), default=0)
    graphs = Column(Numeric(4, 2), default=0)
    dynamic_programming = Column(Numeric(4, 2), default=0)
    system_design = Column(Numeric(4, 2), default=0)
    communication = Column(Numeric(4, 2), default=0)
    coding_speed = Column(Numeric(4, 2), default=0)
    edge_case_thinking = Column(Numeric(4, 2), default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_vector")
