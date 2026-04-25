"""
Skill Vector Model
===================
Per-user skill scores across ALL curriculum subjects.
One row per user, updated after every session using EMA.

Phase A subjects → actively tracked now
Phase B/C subjects → columns exist, stay at 0 until user attempts them

TO ADD A NEW PHASE: just start writing scores to those columns.
No schema changes needed.
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
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # ═══════════════════════════════════════════════
    # PHASE A — Core Computer Science (Active Now)
    # ═══════════════════════════════════════════════
    dsa             = Column(Numeric(4, 2), default=0)
    os              = Column(Numeric(4, 2), default=0)
    dbms            = Column(Numeric(4, 2), default=0)
    cn              = Column(Numeric(4, 2), default=0)
    oops            = Column(Numeric(4, 2), default=0)
    se              = Column(Numeric(4, 2), default=0)
    system_design   = Column(Numeric(4, 2), default=0)
    aptitude        = Column(Numeric(4, 2), default=0)
    guesstimation   = Column(Numeric(4, 2), default=0)
    case_study      = Column(Numeric(4, 2), default=0)

    # ═══════════════════════════════════════════════
    # PHASE B — Programming Languages
    # ═══════════════════════════════════════════════
    python          = Column(Numeric(4, 2), default=0)
    java            = Column(Numeric(4, 2), default=0)
    web_tech        = Column(Numeric(4, 2), default=0)

    # ═══════════════════════════════════════════════
    # PHASE B — AI & Machine Learning
    # ═══════════════════════════════════════════════
    ai              = Column(Numeric(4, 2), default=0)
    ml              = Column(Numeric(4, 2), default=0)
    dl              = Column(Numeric(4, 2), default=0)

    # ═══════════════════════════════════════════════
    # PHASE B — Systems & Architecture
    # ═══════════════════════════════════════════════
    coa             = Column(Numeric(4, 2), default=0)
    microprocessor  = Column(Numeric(4, 2), default=0)
    compiler        = Column(Numeric(4, 2), default=0)
    toc             = Column(Numeric(4, 2), default=0)

    # ═══════════════════════════════════════════════
    # PHASE C — Mathematics
    # ═══════════════════════════════════════════════
    discrete_math   = Column(Numeric(4, 2), default=0)
    linear_algebra  = Column(Numeric(4, 2), default=0)
    engineering_math = Column(Numeric(4, 2), default=0)
    statistics      = Column(Numeric(4, 2), default=0)

    # ═══════════════════════════════════════════════
    # PHASE C — Specialized Topics
    # ═══════════════════════════════════════════════
    crypto          = Column(Numeric(4, 2), default=0)
    graphics        = Column(Numeric(4, 2), default=0)
    mobile          = Column(Numeric(4, 2), default=0)
    competitive     = Column(Numeric(4, 2), default=0)

    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="skill_vector")