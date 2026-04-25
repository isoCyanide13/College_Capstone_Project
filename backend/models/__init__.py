"""
Database Models Package
========================
SQLAlchemy ORM models for the AI Interview Platform.

Models:
    - User         — Student, admin, or placement officer accounts
    - College      — College/institution records
    - Question     — Interview questions (MCQ, coding, theory, system design, behavioral)
    - Session      — Interview session records
    - Answer       — Student responses to questions
    - Evaluation   — AI-generated evaluation results
    - SkillVector  — Per-user skill scores across topics
    - CheatEvent   — Anti-cheat flagged events
    - ConversationLog — AI interview conversation history
"""

from backend.models.user import User
from backend.models.college import College
from backend.models.question import Question
from backend.models.session import Session
from backend.models.answer import Answer
from backend.models.evaluation import Evaluation
from backend.models.skill_vector import SkillVector
from backend.models.cheat_event import CheatEvent
from backend.models.conversation_log import ConversationLog
from backend.models.subtopic_scores import SubtopicScore
from backend.models.feedback import SessionFeedback

__all__ = [
    "User",
    "College",
    "Question",
    "Session",
    "Answer",
    "Evaluation",
    "SkillVector",
    "CheatEvent",
    "ConversationLog",
    "SubtopicScore",
    "SessionFeedback",
]
