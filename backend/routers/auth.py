from datetime import datetime
import os
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.auth_session import AuthSession
from models.email_verification_token import EmailVerificationToken
from models.password_reset_token import PasswordResetToken
from models.user import User
from schemas.auth_schema import (
    CompleteProfileRequest,
    CurrentUserResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerificationResponse,
    VerifyEmailRequest,
)
from services.auth_service import (
    create_email_verification_token,
    create_google_user,
    create_password_reset_token,
    is_profile_completed,
    send_password_reset_email,
    send_verification_email,
)
from services.google_oauth_service import build_google_auth_url, exchange_google_code, fetch_google_userinfo
from utils.hash import hash_password, verify_password
from utils.jwt import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, create_refresh_token, decode_token


router = APIRouter(tags=["Authentication"])
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:3000")


def build_current_user_response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        status=user.status,
        provider=user.provider,
        is_verified=user.is_verified,
        profile_completed=is_profile_completed(user),
    )


def create_session_tokens(user: User, request: Request, db: Session) -> TokenResponse:
    access_token = create_access_token(user.id, user.email, user.role)
    refresh_token, refresh_expires_at = create_refresh_token(user.id)
    db.add(
        AuthSession(
            user_id=user.id,
            refresh_token=refresh_token,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            expires_at=refresh_expires_at.replace(tzinfo=None),
        )
    )
    db.commit()
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    normalized_username = payload.username.strip().lower()

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
        status="active",
        provider="local",
        is_verified=False,
    )
    db.add(user)
    try:
        db.flush()
        verification_token = create_email_verification_token(db, user)
        send_verification_email(user, verification_token.token)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration conflicts with an existing user.") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during registration.") from exc

    return VerificationResponse(message="Registration successful. Please verify your email.", verification_token=verification_token.token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    identifier = payload.identifier.lower().strip()
    user = db.query(User).filter(or_(User.email == identifier, User.username == identifier)).first()
    if not user or user.status.lower() == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password.")

    return create_session_tokens(user, request, db)


@router.get("/google/login")
def google_login():
    return RedirectResponse(build_google_auth_url())


@router.get("/google/callback")
def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    google_tokens = exchange_google_code(code)
    google_user = fetch_google_userinfo(google_tokens["access_token"])
    email = google_user.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account did not provide an email.")

    user = db.query(User).filter(User.email == email).first()
    created = False
    if not user:
        user = create_google_user(
            email=email,
            full_name=(google_user.get("name") or email.split("@", 1)[0]).strip(),
            avatar_url=google_user.get("picture"),
        )
        db.add(user)
        db.flush()
        created = True

    if user.status.lower() == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")

    verification_token = None
    if created or not user.is_verified:
        verification_token = create_email_verification_token(db, user)
        send_verification_email(user, verification_token.token)

    token_response = create_session_tokens(user, request, db)
    next_path = "/feed"
    if not is_profile_completed(user):
        next_path = "/complete-profile"
    elif not user.is_verified:
        next_path = "/verify-email"

    query = urlencode(
        {
            "access_token": token_response.access_token,
            "refresh_token": token_response.refresh_token,
            "next": next_path,
            "email": user.email,
            "verified": str(user.is_verified).lower(),
            "profile_completed": str(is_profile_completed(user)).lower(),
        }
    )
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?{query}")


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

    if token_payload.get("type") != "refresh" or str(session.user_id) != str(token_payload.get("sub")):
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid.")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or user.status.lower() == "deleted":
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    if user.status.lower() == "banned":
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")

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


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(EmailVerificationToken).filter(EmailVerificationToken.token == payload.token).first()
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token is invalid or expired.")
    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or user.status.lower() == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.is_verified = True
    db.delete(record)
    db.commit()
    return MessageResponse(message="Email verified successfully.")


@router.post("/resend-verification", response_model=VerificationResponse)
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or user.status.lower() == "deleted":
        return VerificationResponse(message="If the email exists, a verification link has been sent.")
    if user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")
    if user.is_verified:
        return VerificationResponse(message="Email is already verified.")

    verification_token = create_email_verification_token(db, user)
    send_verification_email(user, verification_token.token)
    db.commit()
    return VerificationResponse(message="Verification email sent.", verification_token=verification_token.token)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or user.status.lower() == "deleted":
        return MessageResponse(message="If the email exists, a reset link has been sent.")
    if user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")

    reset_token = create_password_reset_token(db, user)
    send_password_reset_email(user, reset_token.token)
    db.commit()
    return MessageResponse(message="If the email exists, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_record = db.query(PasswordResetToken).filter(PasswordResetToken.token == payload.token).first()
    if not reset_record or reset_record.used_at is not None or reset_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token is invalid or expired.")

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user or user.status.lower() == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")

    user.password_hash = hash_password(payload.password)
    reset_record.used_at = datetime.utcnow()
    db.query(AuthSession).filter(AuthSession.user_id == user.id).delete()
    db.commit()
    return MessageResponse(message="Password has been reset successfully.")


@router.post("/complete-profile", response_model=CurrentUserResponse)
def complete_profile(
    payload: CompleteProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.status.lower() == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if current_user.status.lower() == "banned":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is banned")

    username = payload.username.strip().lower()
    existing = db.query(User).filter(User.username == username, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists.")

    current_user.username = username
    current_user.full_name = payload.full_name.strip()
    current_user.avatar_url = payload.avatar_url.strip() if payload.avatar_url else current_user.avatar_url
    current_user.bio = payload.bio.strip() if payload.bio else current_user.bio
    db.commit()
    db.refresh(current_user)
    return build_current_user_response(current_user)


@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return build_current_user_response(current_user)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _ = current_user.id
    user = db.query(User).filter(User.id == user_id, User.status == "active").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user
