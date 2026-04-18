"""
User Schemas
=============
Pydantic models for user-related requests and responses.

Phase: 1 — Week 1
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserUpdate(BaseModel):
    """Request schema for updating user profile."""
    name: Optional[str] = None
    email: Optional[str] = None


class UserProfile(BaseModel):
    """Full user profile response."""
    id: UUID
    name: str
    email: str
    role: str
    college_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
