"""
Answer Schemas
===============
Pydantic models for answer submission.

Phase: 1 — Week 4
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class AnswerSubmit(BaseModel):
    """Request schema for submitting an answer."""
    session_id: UUID
    question_id: UUID
    response_text: Optional[str] = None
    response_code: Optional[str] = None
    language: Optional[str] = None  # python, java, cpp, javascript
    time_taken_seconds: Optional[int] = None


class AnswerResponse(BaseModel):
    """Response schema for an answer."""
    id: UUID
    session_id: UUID
    question_id: UUID
    response_text: Optional[str] = None
    response_code: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True
