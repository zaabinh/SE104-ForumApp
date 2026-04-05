import os
from datetime import datetime, timedelta, timezone
from typing import Any

from dotenv import load_dotenv
from jose import JWTError, jwt


load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


def _create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    payload.update({"exp": expire})
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_access_token(user_id: str, email: str, role: str) -> str:
    return _create_token(
        {
            "sub": str(user_id),
            "email": email,
            "role": role,
            "type": "access",
        },
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str) -> tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    token = _create_token(
        {
            "sub": str(user_id),
            "type": "refresh",
        },
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return token, expires_at


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token.") from exc
