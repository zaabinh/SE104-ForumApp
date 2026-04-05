from datetime import datetime

import uuid

from sqlalchemy import DateTime, ForeignKey, String, func, text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(
        UNIQUEIDENTIFIER(as_uuid=False),
        primary_key=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
        server_default=text("NEWSEQUENTIALID()"),
    )
    user_id: Mapped[str] = mapped_column(
        UNIQUEIDENTIFIER(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    refresh_token: Mapped[str] = mapped_column(String(512), nullable=False, unique=True, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="auth_sessions")
