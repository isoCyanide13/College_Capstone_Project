"""
Sessions Router
================
Handles the complete question practice session lifecycle.

POST /api/sessions/start      → Create session, generate questions
GET  /api/sessions/{id}       → Get session + questions
POST /api/answers/submit      → Save one answer
PUT  /api/sessions/{id}/end   → End session, trigger AI evaluation
GET  /api/sessions/{id}/report → Get full scored results
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import uuid
from datetime import datetime

from backend.database.connection import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.session import Session
from backend.models.question import Question
from backend.models.answer import Answer
from backend.models.evaluation import Evaluation
from backend.schemas.sessions import (
    SessionStartRequest,
    SessionStartResponse,
    QuestionResponse,
    AnswerSubmitRequest,
    AnswerSubmitResponse,
    SessionReport,
    EvaluationResult,
)
from backend.services.question_generator import generate_questions
from backend.services.answer_evaluator import evaluate_answer
from backend.services.skill_engine import update_skill_vector, get_skill_vector
from backend.models.feedback import SessionFeedback
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import func, desc

router = APIRouter()


@router.post("/start", response_model=SessionStartResponse, status_code=201)
async def start_session(
    config: SessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Start a new question practice session.
    1. Create session record in database
    2. Call Gemini to generate questions
    3. Save questions to database
    4. Return session_id + questions to frontend
    """

    # Step 1 — Create session
    session = Session(
        user_id=current_user.id,
        session_type="topic_practice",
        status="active",
        domain_id=config.domain_id,
        subject_id=config.subject_id,
        subject_name=config.subject_name,
        skill_field=config.skill_field,
        subtopics=[s.dict() for s in config.subtopics],
        difficulty=config.difficulty,
        question_type=config.question_type,
        question_count=config.question_count,
        started_at=datetime.utcnow(),
    )
    db.add(session)
    await db.flush()  # get session.id without committing

    # Step 2 — Generate questions via Gemini
    try:
        subtopics_list = [s.dict() for s in config.subtopics]
        raw_questions = await generate_questions(
            subject_name=config.subject_name,
            subtopics=subtopics_list,
            difficulty=config.difficulty,
            num_questions=config.question_count,
            question_type=config.question_type,
        )
    except ValueError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(e)}"
        )

    # Step 3 — Save questions to database
    saved_questions = []
    for q in raw_questions:
        question = Question(
            session_id=session.id,
            content=q["question"],
            type=q["type"],
            difficulty=config.difficulty,
            options=q.get("options"),
            correct_answer=q.get("correct_answer"),
            explanation=q.get("explanation"),
            subject_id=config.subject_id,
            subject_name=config.subject_name,
            subtopic_id=q.get("subtopic_id"),
            subtopic_name=q.get("subtopic_name"),
            question_number=q.get("question_number", len(saved_questions) + 1),
            ai_generated=True,
        )
        db.add(question)
        saved_questions.append(question)

    await db.commit()

    # Refresh to get IDs
    for q in saved_questions:
        await db.refresh(q)

    return SessionStartResponse(
        session_id=session.id,
        questions=[
            QuestionResponse(
                id=q.id,
                question_number=q.question_number,
                question=q.content,
                type=q.type,
                options=q.options,
                subtopic_id=q.subtopic_id or "",
                subtopic_name=q.subtopic_name or "",
            )
            for q in saved_questions
        ],
        total_questions=len(saved_questions),
        subject_name=config.subject_name,
        difficulty=config.difficulty,
        question_type=config.question_type,
    )


@router.get("/{session_id}", response_model=SessionStartResponse)
async def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get session details + questions (used when resuming or reviewing)."""

    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await db.execute(
        select(Question)
        .where(Question.session_id == session_id)
        .order_by(Question.question_number)
    )
    questions = result.scalars().all()

    return SessionStartResponse(
        session_id=session.id,
        questions=[
            QuestionResponse(
                id=q.id,
                question_number=q.question_number,
                question=q.content,
                type=q.type,
                options=q.options,
                subtopic_id=q.subtopic_id or "",
                subtopic_name=q.subtopic_name or "",
            )
            for q in questions
        ],
        total_questions=len(questions),
        subject_name=session.subject_name or "",
        difficulty=session.difficulty or "",
        question_type=session.question_type or "",
    )


@router.post("/answers/submit", response_model=AnswerSubmitResponse)
async def submit_answer(
    data: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save one answer from the user.
    Called every time user moves to next question.
    """

    # Verify session belongs to user
    result = await db.execute(
        select(Session).where(
            Session.id == data.session_id,
            Session.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check if answer already exists (update if re-submitting)
    result = await db.execute(
        select(Answer).where(
            Answer.session_id == data.session_id,
            Answer.question_id == data.question_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.response_text = data.answer_text
        existing.time_taken_seconds = data.time_taken_seconds
        answer = existing
    else:
        answer = Answer(
            session_id=data.session_id,
            question_id=data.question_id,
            user_id=current_user.id,
            response_text=data.answer_text,
            time_taken_seconds=data.time_taken_seconds,
        )
        db.add(answer)

    await db.commit()
    await db.refresh(answer)

    return AnswerSubmitResponse(
        answer_id=answer.id,
        question_id=data.question_id,
        saved=True,
    )


@router.put("/{session_id}/end", response_model=SessionReport)
async def end_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    End the session and trigger AI evaluation.
    1. Fetch all questions + answers
    2. Evaluate each answer with Gemini
    3. Update subtopic_scores with EMA
    4. Update skill_vectors
    5. Save session summary
    6. Return full report
    """

    # Fetch session
    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")

    # Fetch questions
    result = await db.execute(
        select(Question)
        .where(Question.session_id == session_id)
        .order_by(Question.question_number)
    )
    questions = result.scalars().all()

    # Fetch answers
    result = await db.execute(
        select(Answer).where(Answer.session_id == session_id)
    )
    answers = result.scalars().all()
    answer_map = {str(a.question_id): a for a in answers}

    # Evaluate each question
    evaluations = []
    total_score = 0
    correct_count = 0
    total_time = 0
    weak_subtopics = []
    strong_subtopics = []
    subtopic_scores: dict[str, list[float]] = {}

    for question in questions:
        answer = answer_map.get(str(question.id))
        user_answer = answer.response_text if answer else ""
        time_taken = answer.time_taken_seconds if answer else 0
        total_time += time_taken or 0

        # Evaluate with Gemini
        eval_result = await evaluate_answer(
            question=question.content,
            question_type=question.type,
            correct_answer=question.correct_answer or "",
            user_answer=user_answer or "",
            topic=session.subject_name or "",
        )

        score = eval_result["score"]
        total_score += score
        if eval_result["is_correct"]:
            correct_count += 1

        # Track subtopic scores
        subtopic_id = question.subtopic_id or session.subject_id or ""
        if subtopic_id not in subtopic_scores:
            subtopic_scores[subtopic_id] = []
        subtopic_scores[subtopic_id].append(score)

        # Save evaluation to database
        evaluation = Evaluation(
            answer_id=answer.id if answer else None,
            score=score,
            feedback=eval_result["feedback"],
            strengths=eval_result["strengths"],
            weaknesses=eval_result["weaknesses"],
            correct_answer=eval_result["correct_answer"],
            is_correct=eval_result["is_correct"],
        )
        db.add(evaluation)

        # Classify weak vs strong
        if score < 5:
            weak_subtopics.append({
                "subtopic_id": question.subtopic_id,
                "subtopic_name": question.subtopic_name,
                "score": score,
                "feedback": eval_result["feedback"],
                "time_taken": time_taken,
            })
        else:
            if question.subtopic_name not in strong_subtopics:
                strong_subtopics.append(question.subtopic_name)

        evaluations.append(EvaluationResult(
            question=question.content,
            question_type=question.type,
            user_answer=user_answer or "No answer provided",
            correct_answer=eval_result["correct_answer"],
            score=score,
            is_correct=eval_result["is_correct"],
            feedback=eval_result["feedback"],
            strengths=eval_result["strengths"],
            weaknesses=eval_result["weaknesses"],
            time_taken=time_taken or 0,
            subtopic_id=question.subtopic_id or "",
            subtopic_name=question.subtopic_name or "",
        ))

    # Calculate summary stats
    num_questions = len(questions)
    avg_score = total_score / num_questions if num_questions > 0 else 0
    accuracy = (correct_count / num_questions * 100) if num_questions > 0 else 0

    # Update skill vector (subject level)
    await update_skill_vector(
        db=db,
        user_id=str(current_user.id),
        subject_skill_field=session.skill_field or "",
        session_score=avg_score,
    )

    # Update session record
    session.status = "completed"
    session.ended_at = datetime.utcnow()
    session.total_score = round(avg_score, 2)
    session.accuracy = round(accuracy, 2)
    session.total_time_seconds = total_time
    session.weak_subtopics = weak_subtopics
    session.strong_subtopics = strong_subtopics
    session.session_summary = {
        "total_score": round(avg_score, 2),
        "accuracy": round(accuracy, 2),
        "total_questions": num_questions,
        "correct": correct_count,
        "total_time": total_time,
    }

    await db.commit()

    return SessionReport(
        session_id=session.id,
        subject_name=session.subject_name or "",
        difficulty=session.difficulty or "",
        total_score=round(avg_score, 2),
        accuracy=round(accuracy, 2),
        total_questions=num_questions,
        correct_count=correct_count,
        total_time_seconds=total_time,
        evaluations=evaluations,
        weak_subtopics=weak_subtopics,
        strong_subtopics=strong_subtopics,
        completed_at=session.ended_at,
    )


@router.get("/{session_id}/report", response_model=SessionReport)
async def get_report(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the completed session report."""

    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id,
            Session.status == "completed"
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Report not found")

    result = await db.execute(
        select(Question)
        .where(Question.session_id == session_id)
        .order_by(Question.question_number)
    )
    questions = result.scalars().all()

    result = await db.execute(
        select(Answer).where(Answer.session_id == session_id)
    )
    answers = result.scalars().all()
    answer_map = {str(a.question_id): a for a in answers}

    evaluations = []
    for q in questions:
        answer = answer_map.get(str(q.id))
        result = await db.execute(
            select(Evaluation).where(Evaluation.answer_id == answer.id)
        ) if answer else None
        eval_record = result.scalar_one_or_none() if result else None

        evaluations.append(EvaluationResult(
            question=q.content,
            question_type=q.type,
            user_answer=answer.response_text if answer else "No answer",
            correct_answer=eval_record.correct_answer if eval_record else q.correct_answer or "",
            score=float(eval_record.score) if eval_record else 0,
            is_correct=eval_record.is_correct if eval_record else False,
            feedback=eval_record.feedback if eval_record else "",
            strengths=eval_record.strengths if eval_record else [],
            weaknesses=eval_record.weaknesses if eval_record else [],
            time_taken=answer.time_taken_seconds if answer else 0,
            subtopic_id=q.subtopic_id or "",
            subtopic_name=q.subtopic_name or "",
        ))

    return SessionReport(
        session_id=session.id,
        subject_name=session.subject_name or "",
        difficulty=session.difficulty or "",
        total_score=float(session.total_score or 0),
        accuracy=float(session.accuracy or 0),
        total_questions=len(questions),
        correct_count=session.session_summary.get("correct", 0) if session.session_summary else 0,
        total_time_seconds=session.total_time_seconds or 0,
        evaluations=evaluations,
        weak_subtopics=session.weak_subtopics or [],
        strong_subtopics=session.strong_subtopics or [],
        completed_at=session.ended_at,
    )

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns real dashboard stats for the logged-in user:
    - Overall average score
    - Total sessions completed
    - Total practice time
    - Recent sessions list
    - Skill vector scores
    - Weak and strong subjects
    """

    # Fetch all completed sessions for this user
    result = await db.execute(
        select(Session)
        .where(
            Session.user_id == current_user.id,
            Session.status == "completed"
        )
        .order_by(desc(Session.ended_at))
    )
    sessions = result.scalars().all()

    total_sessions = len(sessions)

    # Calculate overall average score
    if sessions:
        avg_score = sum(
            float(s.total_score or 0) for s in sessions
        ) / total_sessions
        total_time_seconds = sum(s.total_time_seconds or 0 for s in sessions)
    else:
        avg_score = 0
        total_time_seconds = 0

    # Format total time as hours
    total_hours = round(total_time_seconds / 3600, 1)

    # Recent sessions (last 5)
    recent = []
    for s in sessions[:5]:
        recent.append({
            "session_id": str(s.id),
            "subject_name": s.subject_name or "Unknown",
            "difficulty": s.difficulty or "medium",
            "total_score": float(s.total_score or 0),
            "accuracy": float(s.accuracy or 0),
            "total_questions": s.question_count or 0,
            "ended_at": s.ended_at.isoformat() if s.ended_at else None,
            "weak_subtopics": s.weak_subtopics or [],
            "strong_subtopics": s.strong_subtopics or [],
        })

    # Get skill vector
    skill_scores = await get_skill_vector(db=db, user_id=str(current_user.id))

    # Find weak and strong subjects from skill vector
    active_skills = {k: v for k, v in skill_scores.items() if v > 0}
    weak_subjects = sorted(
        [(k, v) for k, v in active_skills.items() if v < 5],
        key=lambda x: x[1]
    )[:3]
    strong_subjects = sorted(
        [(k, v) for k, v in active_skills.items() if v >= 5],
        key=lambda x: x[1],
        reverse=True
    )[:3]

    return {
        "user_name": current_user.name,
        "total_sessions": total_sessions,
        "avg_score": round(avg_score, 1),
        "total_hours": total_hours,
        "recent_sessions": recent,
        "skill_scores": skill_scores,
        "weak_subjects": [{"subject": k, "score": v} for k, v in weak_subjects],
        "strong_subjects": [{"subject": k, "score": v} for k, v in strong_subjects],
    }
class FeedbackRequest(BaseModel):
    overall_rating: int
    difficulty_appropriate: Optional[bool] = None
    questions_relevant: Optional[bool] = None
    comments: Optional[str] = None


@router.post("/{session_id}/feedback")
async def submit_feedback(
    session_id: UUID,
    feedback: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Store user feedback for a completed session."""

    # Verify session exists and belongs to user
    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check if feedback already exists
    result = await db.execute(
        select(SessionFeedback).where(
            SessionFeedback.session_id == session_id,
            SessionFeedback.user_id == current_user.id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.overall_rating = feedback.overall_rating
        existing.difficulty_appropriate = feedback.difficulty_appropriate
        existing.questions_relevant = feedback.questions_relevant
        existing.comments = feedback.comments
    else:
        new_feedback = SessionFeedback(
            session_id=session_id,
            user_id=current_user.id,
            overall_rating=feedback.overall_rating,
            difficulty_appropriate=feedback.difficulty_appropriate,
            questions_relevant=feedback.questions_relevant,
            comments=feedback.comments,
        )
        db.add(new_feedback)

    await db.commit()
    return {"saved": True, "message": "Feedback saved successfully"}


@router.get("/{session_id}/feedback")
async def get_feedback(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get existing feedback for a session (to pre-fill form)."""
    result = await db.execute(
        select(SessionFeedback).where(
            SessionFeedback.session_id == session_id,
            SessionFeedback.user_id == current_user.id,
        )
    )
    feedback = result.scalar_one_or_none()
    if not feedback:
        return {"exists": False}
    return {
        "exists": True,
        "overall_rating": feedback.overall_rating,
        "difficulty_appropriate": feedback.difficulty_appropriate,
        "questions_relevant": feedback.questions_relevant,
        "comments": feedback.comments,
    }