"""
Skill Engine Service
=====================
Updates skill vectors using EMA after each session.
Maps subject IDs from curriculum → skill_vector columns.
Works for all phases — Phase B/C columns just stay at 0
until user attempts those subjects.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.skill_vector import SkillVector
from datetime import datetime

ALPHA = 0.3  # 30% new session, 70% historical

# Maps subject skillField → database column name
# This is the single source of truth for the mapping
SUBJECT_FIELD_MAP = {
    # Phase A
    "dsa":           "dsa",
    "os":            "os",
    "dbms":          "dbms",
    "cn":            "cn",
    "oops":          "oops",
    "se":            "se",
    "system_design": "system_design",
    "aptitude":      "aptitude",
    "guesstimation": "guesstimation",
    "case_study":    "case_study",
    # Phase B — Programming
    "python":        "python",
    "java":          "java",
    "web_tech":      "web_tech",
    # Phase B — AI/ML
    "ai":            "ai",
    "ml":            "ml",
    "dl":            "dl",
    # Phase B — Systems
    "coa":           "coa",
    "microprocessor": "microprocessor",
    "compiler":      "compiler",
    "toc":           "toc",
    # Phase C — Math
    "discrete_math":    "discrete_math",
    "linear_algebra":   "linear_algebra",
    "engineering_math": "engineering_math",
    "statistics":       "statistics",
    # Phase C — Specialized
    "crypto":        "crypto",
    "graphics":      "graphics",
    "mobile":        "mobile",
    "competitive":   "competitive",
}


async def update_skill_vector(
    db: AsyncSession,
    user_id: str,
    subject_skill_field: str,
    session_score: float,
) -> None:
    """
    Update one subject score using EMA after a session completes.
    Creates the skill vector row if it doesn't exist yet.
    """
    result = await db.execute(
        select(SkillVector).where(SkillVector.user_id == user_id)
    )
    skill_vector = result.scalar_one_or_none()

    if not skill_vector:
        skill_vector = SkillVector(user_id=user_id)
        db.add(skill_vector)

    field_name = SUBJECT_FIELD_MAP.get(subject_skill_field)
    if not field_name:
        return

    current = float(getattr(skill_vector, field_name, 0) or 0)
    new_score = ALPHA * session_score + (1 - ALPHA) * current
    setattr(skill_vector, field_name, round(new_score, 2))
    skill_vector.last_updated = datetime.utcnow()

    await db.commit()


async def get_skill_vector(db: AsyncSession, user_id: str) -> dict:
    """Returns all subject scores for dashboard radar chart."""
    result = await db.execute(
        select(SkillVector).where(SkillVector.user_id == user_id)
    )
    sv = result.scalar_one_or_none()

    if not sv:
        return {field: 0.0 for field in SUBJECT_FIELD_MAP.values()}

    return {
        field: float(getattr(sv, field, 0) or 0)
        for field in SUBJECT_FIELD_MAP.values()
    }