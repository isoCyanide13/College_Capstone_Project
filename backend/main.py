"""
AI Interview Platform — FastAPI Application Entry Point
========================================================
Main application file that initializes FastAPI, registers routers,
middleware, socket handlers, and starts the server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings

# ─── App Initialization ─────────────────────────────────────────────
app = FastAPI(
    title="AI Interview Platform",
    description="AI-powered mock interview simulator with real-time voice interaction, "
                "coding evaluation, computer vision monitoring, and adaptive skill tracking.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routers ─────────────────────────────────────────────────────────
# TODO: Register routers as they are implemented
# Routers
from backend.routers import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
from backend.routers import sessions
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
from backend.routers import dashboard as dashboard_router
app.include_router(sessions.router, prefix="/api/dashboard", tags=["Dashboard"])
# app.include_router(users.router, prefix="/api/users", tags=["Users"])
# app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
# app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
# app.include_router(answers.router, prefix="/api/answers", tags=["Answers"])
# app.include_router(evaluations.router, prefix="/api/evaluations", tags=["Evaluations"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


# ─── Health Check ────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "app": "AI Interview Platform",
        "version": "0.1.0",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# ─── Startup / Shutdown Events ───────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Initialize database connection, Redis, etc."""
    print("🚀 AI Interview Platform backend starting...")
    # TODO: Initialize database connection pool
    # TODO: Initialize Redis connection
    # TODO: Initialize Socket.io


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    print("🔌 AI Interview Platform backend shutting down...")
    # TODO: Close database connections
    # TODO: Close Redis connections
