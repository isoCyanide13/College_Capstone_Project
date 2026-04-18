"""
Evaluation Schemas
===================
Pydantic models for evaluation results.

Phase: 1 — Week 4
Status: 🔲 Not Started
"""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID


class EvaluationResponse(BaseModel):
    """Response schema for an evaluation."""
    id: UUID
    answer_id: UUID
    score: float
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    model_answer: Optional[str] = None
    code_result: Optional[dict] = None
    evaluated_by: str

    class Config:
        from_attributes = True
