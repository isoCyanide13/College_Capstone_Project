"""
Question Generator Service
===========================
Uses Gemini API to generate real, subtopic-aware interview questions.
Supports all curriculum subjects and subtopics across all phases.
"""

import json
import re
import google.generativeai as genai
from backend.config import settings

from groq import Groq

genai.configure(api_key=settings.GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.0-flash")
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


async def generate_questions(
    subject_name: str,
    subtopics: list[dict],
    difficulty: str,
    num_questions: int,
    question_type: str = "mixed",
) -> list[dict]:
    """
    Generate interview questions using Gemini.

    Args:
        subject_name: Full subject name e.g. "Data Structures & Algorithms"
        subtopics: List of {id, name} dicts — specific subtopics to cover
        difficulty: easy, medium, or hard
        num_questions: How many questions to generate
        question_type: mcq, theory, or mixed

    Returns:
        List of validated question dicts
    """

    # Build subtopic context for the prompt
    subtopic_names = [s["name"] for s in subtopics]
    subtopic_context = ", ".join(subtopic_names)

    # Question type instruction
    if question_type == "mcq":
        type_instruction = (
            "ALL questions must be Multiple Choice Questions (MCQ) "
            "with exactly 4 options. No theory questions."
        )
        format_note = "Every question must have options array with exactly 4 items."
    elif question_type == "theory":
        type_instruction = (
            "ALL questions must be open-ended theory questions "
            "requiring written explanation. No MCQs."
        )
        format_note = "Every question must have options set to null."
    else:
        mcq_count = num_questions // 2
        theory_count = num_questions - mcq_count
        type_instruction = (
            f"Generate exactly {mcq_count} MCQ questions and "
            f"{theory_count} theory/explanation questions. Mix them randomly."
        )
        format_note = "MCQ questions must have options array. Theory questions must have options as null."

    # Difficulty guidance
    difficulty_guide = {
        "easy": "fundamental concepts, definitions, basic examples — suitable for beginners",
        "medium": "application of concepts, comparison questions, practical scenarios",
        "hard": "advanced edge cases, complex scenarios, optimization, tricky distinctions",
    }.get(difficulty, "medium-level concepts")

    prompt = f"""You are a senior technical interviewer at a top-tier tech company (Google/Amazon/Microsoft level).

Your task: Generate exactly {num_questions} {difficulty}-level interview questions.

Subject: {subject_name}
Specific Topics to Cover: {subtopic_context}

Question Type: {type_instruction}

Difficulty Standard ({difficulty}): {difficulty_guide}

STRICT RULES:
1. Distribute questions across ALL listed topics — do not focus on just one topic
2. Each question must test a DIFFERENT concept — no repetition
3. MCQ options must all be plausible — no obviously wrong answers
4. Theory questions must require conceptual understanding, not yes/no answers
5. Questions must match the difficulty level strictly
6. For aptitude/guesstimation questions: make them practical and realistic
7. For case study questions: provide enough context for the candidate to analyze
8. {format_note}
9. Assign the most relevant subtopic_id and subtopic_name from the list to each question

Available subtopics (use these exact ids and names):
{json.dumps(subtopics, indent=2)}

Return ONLY a valid JSON array. Zero explanation, zero markdown, zero code blocks.
Use this EXACT format:

[
  {{
    "question": "What is the time complexity of binary search and why?",
    "type": "mcq",
    "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    "correct_answer": "O(log n)",
    "explanation": "Binary search halves the search space each step, giving O(log n).",
    "subtopic_id": "dsa_searching",
    "subtopic_name": "Searching Algorithms"
  }},
  {{
    "question": "Explain the difference between a process and a thread with a real-world analogy.",
    "type": "theory",
    "options": null,
    "correct_answer": "A process is an independent program with its own memory space. A thread is a lightweight execution unit within a process that shares memory. Analogy: A process is a restaurant, threads are the waiters working inside it.",
    "explanation": "Key distinction is memory isolation vs sharing.",
    "subtopic_id": "os_threads",
    "subtopic_name": "Threads & Concurrency"
  }}
]"""

    try:
        try:
            # Try Gemini first
            response = gemini_model.generate_content(prompt)
            raw_text = response.text.strip()
        except Exception as gemini_error:
        # Fallback to Groq if Gemini fails
            if groq_client:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                )
                raw_text = response.choices[0].message.content.strip()
            else:
                raise gemini_error

        # Clean markdown wrappers if Gemini adds them
        raw_text = re.sub(r"```json\s*", "", raw_text)
        raw_text = re.sub(r"```\s*", "", raw_text)
        raw_text = raw_text.strip()

        questions = json.loads(raw_text)

        # Validate and clean each question
        validated = []
        for i, q in enumerate(questions):
            if "question" not in q or "type" not in q:
                continue

            # Find matching subtopic from provided list
            subtopic_id = q.get("subtopic_id", subtopics[0]["id"] if subtopics else "")
            subtopic_name = q.get("subtopic_name", subtopics[0]["name"] if subtopics else "")

            # Validate MCQ has exactly 4 options
            options = q.get("options")
            if q.get("type") == "mcq" and (not options or len(options) != 4):
                options = options[:4] if options and len(options) >= 4 else options

            validated.append({
                "question_number": i + 1,
                "question": q.get("question", "").strip(),
                "type": q.get("type", "theory"),
                "options": options,
                "correct_answer": q.get("correct_answer", "").strip(),
                "explanation": q.get("explanation", "").strip(),
                "subtopic_id": subtopic_id,
                "subtopic_name": subtopic_name,
            })

        return validated[:num_questions]

    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw: {raw_text[:200]}")
    except Exception as e:
        raise ValueError(f"Question generation failed: {e}")