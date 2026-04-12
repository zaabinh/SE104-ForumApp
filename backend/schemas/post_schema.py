from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from schemas.auth_schema import UserResponse
from schemas.common_schema import PaginationMeta


class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str
    cover_image: str | None = None
    tags: list[str] = Field(default_factory=list)


class PostCreate(BaseModel):
    title: str
    content: str
    cover_image: str | None = None
    tags: list[str] = Field(default_factory=list)


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=255)
    content: str | None = None
    cover_image: str | None = None
    tags: list[str] | None = None
    status: str | None = None


class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    status: str | None
    created_at: datetime
    author: UserResponse
    likes_count: int = 0
    comments_count: int = 0
    views_count: int = 0
    shares_count: int = 0
    trending_score: int = 0
    is_liked: bool = False
    is_bookmarked: bool = False


class PostListResponse(BaseModel):
    items: list[PostResponse]
    meta: PaginationMeta
