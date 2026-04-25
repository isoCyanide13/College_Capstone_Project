"""
Answer Evaluator Service
=========================
Uses Gemini to evaluate user answers and provide detailed feedback.
Handles both MCQ (exact match) and theory (AI evaluation).
"""

import json
import re
import google.generativeai as genai
from backend.config import settings
from groq import Groq


genai.configure(api_key=settings.GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.0-flash")
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


async def evaluate_answer(
    question: str,
    question_type: str,
    correct_answer: str,
    user_answer: str,
    topic: str,
) -> dict:
    """
    Evaluate a single answer.
    
    MCQ: Simple string match → instant result
    Theory: Gemini evaluates conceptual understanding → score + feedback
    
    Returns:
        dict with score (0-10), is_correct, feedback, correct_answer
    """

    # MCQ — just check if answer matches
    if question_type == "mcq":
        user_clean = user_answer.strip().lower()
        correct_clean = correct_answer.strip().lower()
        is_correct = (
            user_clean == correct_clean or
            user_clean in correct_clean or
            correct_clean in user_clean
        )

        # Generate explanation for MCQ via AI
        explain_prompt = f"""You are a technical interviewer. Explain why the answer to this MCQ is correct in 2-3 sentences.

Question: {question}
Correct Answer: {correct_answer}
{"The candidate answered correctly." if is_correct else f"The candidate answered: {user_answer} (incorrect)"}

Return ONLY valid JSON, no markdown:
{{
  "explanation": "The correct answer is X because...",
  "feedback": "{'Well done! ' if is_correct else 'Incorrect. '}Brief feedback here.",
  "strengths": {json.dumps(["Correctly identified the answer"] if is_correct else [])},
  "weaknesses": {json.dumps([] if is_correct else ["Selected wrong option"])}
}}"""

        try:
            try:
                response = gemini_model.generate_content(explain_prompt)
                raw = response.text.strip()
            except Exception:
                if groq_client:
                    response = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[{"role": "user", "content": explain_prompt}],
                        temperature=0.3,
                    )
                    raw = response.choices[0].message.content.strip()
                else:
                    raise

            raw = re.sub(r"```json\s*", "", raw)
            raw = re.sub(r"```\s*", "", raw).strip()
            result = json.loads(raw)

            return {
                "score": 10 if is_correct else 0,
                "is_correct": is_correct,
                "feedback": result.get("feedback", "Correct!" if is_correct else f"The correct answer is: {correct_answer}"),
                "correct_answer": result.get("explanation", correct_answer),
                "strengths": result.get("strengths", ["Correctly identified the answer"] if is_correct else []),
                "weaknesses": result.get("weaknesses", [] if is_correct else ["Selected wrong option"]),
            }
        except Exception:
            return {
                "score": 10 if is_correct else 0,
                "is_correct": is_correct,
                "feedback": "Correct!" if is_correct else f"The correct answer is: {correct_answer}",
                "correct_answer": correct_answer,
                "strengths": ["Correctly identified the answer"] if is_correct else [],
                "weaknesses": [] if is_correct else ["Selected wrong option"],
            }

    # Theory — use Gemini to evaluate
    prompt = f"""You are a strict but fair technical interviewer evaluating a candidate's answer.

Topic: {topic}
Question: {question}
Expected Answer: {correct_answer}
Candidate's Answer: {user_answer}

Evaluate the candidate's answer on a scale of 0-10:
- 0-2: Completely wrong or no understanding shown
- 3-4: Partial understanding, major gaps
- 5-6: Decent understanding, some gaps
- 7-8: Good understanding, minor gaps
- 9-10: Excellent, complete and accurate

Return ONLY valid JSON, no markdown, no explanation outside JSON:
{{
  "score": 7,
  "is_correct": true,
  "feedback": "Good explanation of the concept. You correctly identified X but missed Y.",
  "strengths": ["Correctly explained X", "Good example given"],
  "weaknesses": ["Did not mention Y", "Could elaborate on Z"],
  "correct_answer": "A complete answer would include..."
}}"""

    try:
        try:
            response = gemini_model.generate_content(prompt)
            raw_text = response.text.strip()
        except Exception:
            if groq_client:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                )
                raw_text = response.choices[0].message.content.strip()
            else:
                raise
        raw_text = re.sub(r"```json\s*", "", raw_text)
        raw_text = re.sub(r"```\s*", "", raw_text)
        raw_text = raw_text.strip()

        result = json.loads(raw_text)
        return {
            "score": min(10, max(0, int(result.get("score", 5)))),
            "is_correct": result.get("is_correct", False),
            "feedback": result.get("feedback", ""),
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "correct_answer": result.get("correct_answer", correct_answer),
        }

    except Exception as e:
        return {
            "score": 0,
            "is_correct": False,
            "feedback": f"Evaluation failed: {e}",
            "strengths": [],
            "weaknesses": [],
            "correct_answer": correct_answer,
        }


async def evaluate_session(answers_with_questions: list[dict], topic: str) -> dict:
    """
    Evaluate all answers in a session and return summary.
    Also identifies weak topics for skill vector update.
    """
    evaluations = []
    total_score = 0
    weak_areas = []
    strong_areas = []

    for item in answers_with_questions:
        evaluation = await evaluate_answer(
            question=item["question"],
            question_type=item["question_type"],
            correct_answer=item["correct_answer"],
            user_answer=item["user_answer"],
            topic=topic,
        )
        evaluations.append({
            **evaluation,
            "question": item["question"],
            "user_answer": item["user_answer"],
            "time_taken": item.get("time_taken", 0),
        })
        total_score += evaluation["score"]

        # Classify as weak or strong
        if evaluation["score"] < 5:
            weak_areas.append({
                "question": item["question"],
                "score": evaluation["score"],
                "feedback": evaluation["feedback"],
                "time_taken": item.get("time_taken", 0),
            })
        else:
            strong_areas.append(item["question"][:50])

    num_questions = len(evaluations)
    avg_score = total_score / num_questions if num_questions > 0 else 0
    accuracy = len([e for e in evaluations if e["is_correct"]]) / num_questions if num_questions > 0 else 0

    return {
        "evaluations": evaluations,
        "summary": {
            "total_score": round(avg_score, 1),
            "accuracy": round(accuracy * 100, 1),
            "total_questions": num_questions,
            "correct": len([e for e in evaluations if e["is_correct"]]),
            "weak_areas": weak_areas,
            "strong_areas": strong_areas,
        }
    }