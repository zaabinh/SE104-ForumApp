from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.comment import Comment
from schemas.comment_schema import CommentCreate, CommentResponse
from auth import get_current_user
from models.user import User

router = APIRouter(prefix="/posts/{post_id}/comments", tags=["Comments"])

@router.post("/", response_model=CommentResponse)
def create_comment(
    post_id: int, 
    payload: CommentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra nếu là reply thì parent_id phải tồn tại
    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.content,
        parent_id=payload.parent_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    # Lấy tất cả bình luận của bài viết
    all_comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    
    # Logic để tạo cấu trúc lồng nhau (Nested)
    comment_dict = {c.id: c for c in all_comments}
    root_comments = []

    for c in all_comments:
        if c.parent_id is None:
            root_comments.append(c)
        else:
            parent = comment_dict.get(c.parent_id)
            if parent:
                if not hasattr(parent, 'replies'):
                    parent.replies = []
                parent.replies.append(c)
                
    return root_comments
