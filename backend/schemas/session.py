"""
Session Schemas
================
Pydantic models for interview session management.

Phase: 1 — Week 3
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class SessionConfig(BaseModel):
    """Request schema for starting a new session."""
    session_type: str  # full_test, custom, ai_interview, mock_panel
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    count: int = 10  # Number of questions


class SessionResponse(BaseModel):
    """Response schema for a session."""
    id: UUID
    user_id: UUID
    session_type: str
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SessionReport(BaseModel):
    """Detailed session report."""
    session: SessionResponse
    total_score: float
    questions_answered: int
    total_questions: int
    skill_breakdown: dict
    cheat_events_count: int
    recommendations: List[str]
