from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from schemas.auth_schema import UserResponse

class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str
    cover_image: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    content: Optional[str] = None
    cover_image: Optional[str] = None

class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: str
    slug: Optional[str]
    status: Optional[str]
    created_at: datetime
    author: UserResponse  # Trả về kèm thông tin người viết bài
