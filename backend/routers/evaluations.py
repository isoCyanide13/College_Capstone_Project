"""
Evaluations Router
===================
Retrieves AI-generated evaluation results for submitted answers.

Endpoints:
    GET /api/evaluations/{answer_id}   — Get evaluation for an answer
    GET /api/evaluations/session/{id}  — Get all evaluations for a session
    
"""

from fastapi import APIRouter

router = APIRouter()
