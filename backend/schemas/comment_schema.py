from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from schemas.auth_schema import UserResponse

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    parent_id: Optional[int] = None # Nếu có ID này thì là phản hồi (reply)

class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    post_id: int
    user_id: str
    parent_id: Optional[int]
    created_at: datetime
    author: UserResponse
    replies: List['CommentResponse'] = [] # Danh sách các phản hồi con
