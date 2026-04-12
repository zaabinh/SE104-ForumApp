import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func, text, Unicode, UnicodeText
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UNIQUEIDENTIFIER(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=text("NEWSEQUENTIALID()"),
    )
    username: Mapped[str | None] = mapped_column(String(50), nullable=True, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="Student", server_default="Student")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active", server_default="active")
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="local", server_default="local")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    auth_sessions = relationship("AuthSession", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    post_likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    post_views = relationship("PostView", back_populates="user")
    post_shares = relationship("PostShare", back_populates="user")
    reports = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter")
    notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user", cascade="all, delete-orphan")
    notification_events = relationship("Notification", foreign_keys="Notification.actor_id", back_populates="actor")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    email_verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    following = relationship(
        "Follow",
        foreign_keys="Follow.follower_id",
        back_populates="follower",
        cascade="all, delete-orphan",
    )
    followers = relationship(
        "Follow",
        foreign_keys="Follow.following_id",
        back_populates="following",
        cascade="all, delete-orphan",
    )
