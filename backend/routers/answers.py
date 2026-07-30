"""
Answers Router
===============
Handles answer submission and retrieval for interview sessions.

Endpoints:
    POST /api/answers/              — Submit an answer
    GET  /api/answers/{session_id}  — Get all answers for a session
    POST /api/answers/code          — Submit code answer for Judge0 execution
"""

from fastapi import APIRouter

router = APIRouter()
