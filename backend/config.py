"""
AI Interview Platform — Configuration
=======================================
Application settings loaded from environment variables using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings — loaded from .env file or environment variables."""

    # ─── App ─────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    # ─── Database ────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/interview_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/interview_db"

    # ─── Redis ───────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── JWT ─────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ─── AI / LLM APIs ──────────────────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    # ─── Speech-to-Text ──────────────────────────────────────────────
    OPENAI_API_KEY: Optional[str] = None
    DEEPGRAM_API_KEY: Optional[str] = None

    # ─── Text-to-Speech ──────────────────────────────────────────────
    ELEVENLABS_API_KEY: Optional[str] = None

    # ─── Code Execution ──────────────────────────────────────────────
    JUDGE0_API_KEY: Optional[str] = None
    JUDGE0_BASE_URL: str = "https://judge0-ce.p.rapidapi.com"

    # ─── Emotion Detection ───────────────────────────────────────────
    HUME_API_KEY: Optional[str] = None

    # ─── Storage ─────────────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: str = "interview-recordings"
    AWS_REGION: str = "ap-south-1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton instance
settings = Settings()
