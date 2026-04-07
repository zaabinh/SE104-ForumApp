from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from schemas.auth_schema import UserResponse

#  Schema cho Tag để hiển thị trong PostResponse
class TagResponse(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str
    cover_image: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    cover_image: Optional[str] = None
    tags: List[str] = []

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    content: Optional[str] = None
    cover_image: Optional[str] = None

#  PostResponse để trả về View Count và danh sách Tags
class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    slug: str
    cover_image: Optional[str]
    view_count: int 
    created_at: datetime
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True
