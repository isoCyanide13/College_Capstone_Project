"""
Session Schemas
================
Pydantic models for session requests and responses.
"""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class SubtopicConfig(BaseModel):
    id: str
    name: str


class SessionStartRequest(BaseModel):
    """What frontend sends when user clicks Begin Practice."""
    domain_id: str
    subject_id: str
    subject_name: str
    skill_field: str
    subtopics: List[SubtopicConfig]
    difficulty: str = "medium"
    question_type: str = "mixed"
    question_count: int = 10


class QuestionResponse(BaseModel):
    """Single question returned to frontend."""
    id: UUID
    question_number: int
    question: str
    type: str
    options: Optional[List[str]] = None
    subtopic_id: str
    subtopic_name: str

    class Config:
        from_attributes = True


class SessionStartResponse(BaseModel):
    """Returned after session is created."""
    session_id: UUID
    questions: List[QuestionResponse]
    total_questions: int
    subject_name: str
    difficulty: str
    question_type: str


class AnswerSubmitRequest(BaseModel):
    """User submits one answer."""
    session_id: UUID
    question_id: UUID
    answer_text: str
    time_taken_seconds: int


class AnswerSubmitResponse(BaseModel):
    """Confirmation after answer saved."""
    answer_id: UUID
    question_id: UUID
    saved: bool


class EvaluationResult(BaseModel):
    """AI evaluation of one answer."""
    question: str
    question_type: str
    user_answer: str
    correct_answer: str
    score: float
    is_correct: bool
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    time_taken: int
    subtopic_id: str
    subtopic_name: str


class SessionReport(BaseModel):
    """Full session report after evaluation."""
    session_id: UUID
    subject_name: str
    difficulty: str
    total_score: float
    accuracy: float
    total_questions: int
    correct_count: int
    total_time_seconds: int
    evaluations: List[EvaluationResult]
    weak_subtopics: List[dict]
    strong_subtopics: List[str]
    completed_at: datetime