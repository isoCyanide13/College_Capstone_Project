"""
Dashboard Router
=================
Analytics endpoints for student dashboard and placement cell dashboard.

Endpoints:
    GET /api/dashboard/student          — Student skill overview
    GET /api/dashboard/student/history  — Session history with trends
    GET /api/dashboard/admin/batch      — Batch readiness (placement officer)
    GET /api/dashboard/admin/students   — Per-student skill breakdown

"""

from fastapi import APIRouter

router = APIRouter()
