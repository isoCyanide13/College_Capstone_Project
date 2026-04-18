"""
Skill Vector Schemas
=====================
Pydantic models for skill vector data.

Phase: 5 — Week 17
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class SkillVectorResponse(BaseModel):
    """Response schema for a user's skill vector."""
    user_id: UUID
    arrays: float = 0
    linked_lists: float = 0
    trees: float = 0
    graphs: float = 0
    dynamic_programming: float = 0
    system_design: float = 0
    communication: float = 0
    coding_speed: float = 0
    edge_case_thinking: float = 0
    last_updated: datetime

    class Config:
        from_attributes = True
