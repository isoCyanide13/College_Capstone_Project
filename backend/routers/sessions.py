"""
Sessions Router
================
Manages interview session lifecycle — creation, start, end, and retrieval.

Endpoints:
    POST /api/sessions/start     — Start a new interview session
    GET  /api/sessions/          — List user's sessions
    GET  /api/sessions/{id}      — Get session details
    PUT  /api/sessions/{id}/end  — End active session
    GET  /api/sessions/{id}/report — Get session report

Implementation Phase: Phase 1 — Week 3
Status: 🔲 Not Started
"""

from fastapi import APIRouter

router = APIRouter()
