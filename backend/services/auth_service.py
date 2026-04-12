from datetime import datetime, timedelta
import secrets

from sqlalchemy.orm import Session

from models.email_verification_token import EmailVerificationToken
from models.password_reset_token import PasswordResetToken
from models.user import User
from services.email_service import build_password_reset_link, build_verification_link, send_email_message
from utils.hash import hash_password


def is_profile_completed(user: User) -> bool:
    return bool(user.username and user.username.strip())


def create_email_verification_token(db: Session, user: User) -> EmailVerificationToken:
    db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user.id).delete()
    token = EmailVerificationToken(
        user_id=user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(token)
    db.flush()
    return token


def send_verification_email(user: User, token: str) -> None:
    link = build_verification_link(token)
    send_email_message(
        user.email,
        "Verify your Forum account",
        f"Hello {user.full_name},\n\nVerify your email here: {link}\n\nThis link expires in 24 hours.",
    )


def create_password_reset_token(db: Session, user: User) -> PasswordResetToken:
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None)).delete()
    token = PasswordResetToken(
        user_id=user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.utcnow() + timedelta(minutes=30),
    )
    db.add(token)
    db.flush()
    return token


def send_password_reset_email(user: User, token: str) -> None:
    link = build_password_reset_link(token)
    send_email_message(
        user.email,
        "Reset your Forum password",
        f"Hello {user.full_name},\n\nReset your password here: {link}\n\nThis link expires in 30 minutes.",
    )


def create_google_user(*, email: str, full_name: str, avatar_url: str | None) -> User:
    return User(
        username=None,
        email=email,
        password_hash=hash_password(secrets.token_urlsafe(32)),
        full_name=full_name or email.split("@", 1)[0],
        avatar_url=avatar_url,
        bio=None,
        role="Student",
        status="active",
        provider="google",
        is_verified=False,
    )
