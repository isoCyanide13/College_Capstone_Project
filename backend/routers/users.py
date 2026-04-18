"""
Users Router
==============
Handles user profile management and CRUD operations.

Endpoints:
    GET    /api/users/         — List users (admin only)
    GET    /api/users/{id}     — Get user profile
    PUT    /api/users/{id}     — Update user profile
    DELETE /api/users/{id}     — Delete user (admin only)

Implementation Phase: Phase 1 — Week 1
Status: 🔲 Not Started
"""

from fastapi import APIRouter

router = APIRouter()
