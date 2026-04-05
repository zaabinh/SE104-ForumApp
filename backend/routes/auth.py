from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.auth_session import AuthSession
from models.user import User
from schemas.auth_schema import (
    CurrentUserResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from utils.hash import hash_password, verify_password
from utils.jwt import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, create_refresh_token, decode_token


router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    normalized_username = payload.username.strip()

    existing_user = (
        db.query(User)
        .filter(or_(User.email == normalized_email, User.username == normalized_username))
        .first()
    )
    if existing_user:
        if existing_user.email == normalized_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists.")

    user = User(
        username=normalized_username,
        email=normalized_email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="Student",
        status="Active",
        provider="local",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration could not be completed because the user data conflicts with the current database schema or existing records.",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {exc.__class__.__name__}",
        ) from exc

    return MessageResponse(message="User registered successfully.")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(
            User.email == payload.identifier.lower().strip(),
            User.username == payload.identifier.lower().strip()
        )
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    if user.status.lower() != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active.")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password.")

    access_token = create_access_token(user.id, user.email, user.role)
    refresh_token, refresh_expires_at = create_refresh_token(user.id)

    auth_session = AuthSession(
        user_id=user.id,
        refresh_token=refresh_token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=refresh_expires_at.replace(tzinfo=None),
    )
    db.add(auth_session)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    session = db.query(AuthSession).filter(AuthSession.refresh_token == payload.refresh_token).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found.")

    if session.expires_at < datetime.utcnow():
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired.")

    try:
        token_payload = decode_token(payload.refresh_token)
    except ValueError as exc:
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    if token_payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")

    if str(session.user_id) != str(token_payload.get("sub")):
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid.")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    access_token = create_access_token(user.id, user.email, user.role)
    return TokenResponse(
        access_token=access_token,
        refresh_token=payload.refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    session = db.query(AuthSession).filter(AuthSession.refresh_token == payload.refresh_token).first()
    if session:
        db.delete(session)
        db.commit()

    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user
