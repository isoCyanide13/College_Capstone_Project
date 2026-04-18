"""
Question Schemas
=================
Pydantic models for question CRUD and AI generation.

Phase: 1 — Week 2
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class QuestionCreate(BaseModel):
    """Request schema for creating a question manually."""
    content: str
    type: str  # mcq, coding, theory, system_design, behavioral
    difficulty: str  # easy, medium, hard
    topic: Optional[str] = None
    company_tag: Optional[str] = None
    expected_answer: Optional[str] = None
    test_cases: Optional[list] = None


class QuestionGenerateRequest(BaseModel):
    """Request schema for AI question generation."""
    topic: str
    difficulty: str
    count: int = 5


class QuestionResponse(BaseModel):
    """Response schema for a question."""
    id: UUID
    content: str
    type: str
    difficulty: str
    topic: Optional[str] = None
    company_tag: Optional[str] = None
    ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True
