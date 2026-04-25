"""
Authentication Router
======================
POST /api/auth/register  — Create new user account
POST /api/auth/login     — Authenticate and receive JWT token
GET  /api/auth/me        — Get current authenticated user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database.connection import get_db
from backend.models.user import User
from backend.schemas.auth import UserCreate, LoginRequest, TokenResponse, UserResponse
from backend.middleware.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    1. Check if email already exists
    2. Hash the password
    3. Save user to database
    4. Return the created user (without password)
    """
    # Step 1 — Check if email already taken
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    # Step 2 — Hash the password (never store plain text)
    hashed_password = get_password_hash(user_data.password)

    # Step 3 — Create the user record
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        college_id=user_data.college_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login with email and password.
    1. Find user by email
    2. Verify password
    3. Return JWT token
    """
    # Step 1 — Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    # Step 2 — Verify password (same error for both cases — don't reveal which failed)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Step 3 — Create and return JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        name=user.name,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    The JWT token in the request header identifies who they are.
    """
    return current_user