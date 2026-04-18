"""
Auth Schemas
=============
Pydantic models for authentication requests and responses.

Phase: 1 — Week 1
Status: 🔲 Not Started
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserCreate(BaseModel):
    """Request schema for user registration."""
    name: str
    email: str
    password: str
    role: str = "student"
    college_id: Optional[UUID] = None


class LoginRequest(BaseModel):
    """Request schema for login."""
    email: str
    password: str


class TokenResponse(BaseModel):
    """Response schema for JWT token."""
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    role: str


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: UUID
    name: str
    email: str
    role: str
    college_id: Optional[UUID] = None

    class Config:
        from_attributes = True
