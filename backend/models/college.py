"""
College Model
==============
Represents educational institutions.

Table: colleges
Phase: 1 — Week 1
Status: 🔲 Not Started
"""

import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from backend.database.connection import Base


class College(Base):
    __tablename__ = "colleges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    batch_year = Column(Integer, nullable=True)
    placement_officer_id = Column(UUID(as_uuid=True), nullable=True)

    # Relationships
    users = relationship("User", back_populates="college")
