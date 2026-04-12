from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from schemas.auth_schema import UserResponse


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    parent_id: int | None = None


class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    user_id: str
    parent_id: int | None
    created_at: datetime
    author: UserResponse
    replies: list["CommentResponse"] = Field(default_factory=list)


CommentResponse.model_rebuild()
