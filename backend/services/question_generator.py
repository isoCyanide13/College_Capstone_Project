"""
Question Generator Service
============================
Uses Gemini API to generate interview questions dynamically.

Generates questions based on topic, difficulty, and count.
Returns structured JSON that can be stored directly in the database.

Phase: 1 — Week 2
Status: 🔲 Not Started
Dependencies: google-generativeai
"""

# import google.generativeai as genai
# import json
# from backend.config import settings
#
#
# class QuestionGenerator:
#     """Generates interview questions using Gemini AI."""
#
#     def __init__(self):
#         genai.configure(api_key=settings.GEMINI_API_KEY)
#         self.model = genai.GenerativeModel('gemini-1.5-pro')
#
#     async def generate_questions(self, topic: str, difficulty: str, count: int) -> list:
#         """Generate interview questions on a specific topic."""
#         prompt = f"""
#         Generate {count} {difficulty} interview questions on the topic: {topic}.
#         Return ONLY a valid JSON array. No preamble.
#
#         Format:
#         [
#           {{
#             "content": "question text",
#             "type": "theory or coding",
#             "topic": "{topic}",
#             "difficulty": "{difficulty}",
#             "expected_answer": "detailed answer outline",
#             "company_tag": "Google/Amazon/etc or null"
#           }}
#         ]
#         """
#         response = self.model.generate_content(prompt)
#         raw = response.text.strip().replace("```json", "").replace("```", "")
#         return json.loads(raw)
