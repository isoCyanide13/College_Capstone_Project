"""
Questions Router
=================
Question CRUD and AI-powered question generation endpoints.

Endpoints:
    GET    /api/questions/           — List questions with filters
    POST   /api/questions/           — Create question manually
    POST   /api/questions/generate   — Generate questions via Gemini AI
    GET    /api/questions/{id}       — Get question details
    PUT    /api/questions/{id}       — Update question
    DELETE /api/questions/{id}       — Delete question

"""

from fastapi import APIRouter

router = APIRouter()
