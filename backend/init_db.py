"""Initialize database tables without dropping existing data."""

from database import Base, engine
from models import (
    AdminAuditLog,
    AuthSession,
    Bookmark,
    Comment,
    EmailVerificationToken,
    Follow,
    Notification,
    PasswordResetToken,
    Post,
    PostLike,
    PostShare,
    PostTag,
    PostView,
    Report,
    Tag,
    User,
)

_ = (
    AdminAuditLog,
    AuthSession,
    Bookmark,
    Comment,
    EmailVerificationToken,
    Follow,
    Notification,
    PasswordResetToken,
    Post,
    PostLike,
    PostShare,
    PostTag,
    PostView,
    Report,
    Tag,
    User,
)

Base.metadata.create_all(bind=engine)
print("Database tables initialized successfully.")
