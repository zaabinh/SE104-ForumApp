from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, DateTime, ForeignKey, Float, Integer, String, Text, func, Table
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

# Bảng trung gian Nhiều-Nhiều (Post <-> Tag)
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        UNIQUEIDENTIFIER(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    trending_score: Mapped[float] = mapped_column(Float, default=0.0, server_default=text("0.0"))
    status: Mapped[str] = mapped_column(String(20), default="Pending", server_default=text("'Pending'"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    author: Mapped["User"] = relationship("User", back_populates="posts")
    tags: Mapped[List["Tag"]] = relationship("Tag", secondary=post_tags, back_populates="posts")
