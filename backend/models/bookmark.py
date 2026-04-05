from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    user_id: Mapped[str] = mapped_column(
        UNIQUEIDENTIFIER(as_uuid=False),
        ForeignKey("users.id"),
        primary_key=True,
    )
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="bookmarks")
    post = relationship("Post", back_populates="bookmarks")
