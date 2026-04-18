"""
Database Connection
====================
Async SQLAlchemy engine and session management for PostgreSQL.

Phase: 1 — Week 1
Status: 🔲 Not Started
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.config import settings


# ─── Engine ──────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG,
    pool_size=20,
    max_overflow=10,
)

# ─── Session Factory ─────────────────────────────────────────────────
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ─── Base Model ──────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ─── Dependency Injection ────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """FastAPI dependency that yields a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# ─── Table Creation (development only) ───────────────────────────────
async def create_tables():
    """Create all tables — use only in development. Use Alembic for production."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables():
    """Drop all tables — DANGEROUS, development only."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
