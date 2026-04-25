"""
Auth Schemas
=============
Pydantic models for authentication requests and responses.
Includes email validation and password strength rules.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from uuid import UUID
import re


class UserCreate(BaseModel):
    """Request schema for user registration."""
    name: str
    email: EmailStr        # automatically validates email format
    password: str
    role: str = "student"
    college_id: Optional[UUID] = None

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be under 100 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v):
        allowed = {"student", "admin", "placement_officer"}
        if v not in allowed:
            raise ValueError(f"Role must be one of: {allowed}")
        return v


class LoginRequest(BaseModel):
    """Request schema for login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response schema returned after successful login."""
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    role: str
    name: str


class UserResponse(BaseModel):
    """Response schema for user profile data."""
    id: UUID
    name: str
    email: str
    role: str
    college_id: Optional[UUID] = None

    class Config:
        from_attributes = True