import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.post import Post
from models.user import User
from schemas.post_schema import PostCreate, PostUpdate, PostResponse
from auth import get_current_user

router = APIRouter(prefix="/posts", tags=["Posts"])

# Hàm helper tạo slug tự động
def generate_slug(title: str):
    title = title.lower()
    return re.sub(r'[^\w\s-]', '', title).replace(' ', '-')

@router.post("/", response_model=PostResponse)
def create_post(payload: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_post = Post(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
        cover_image=payload.cover_image,
        slug=generate_slug(payload.title),
        status="active"
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get("/feed", response_model=List[PostResponse])
def get_posts_feed(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    # Hiển thị bài viết mới nhất trên bảng feed
    return db.query(Post).filter(Post.status == "active").order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
    
    if "title" in update_data:
        post.slug = generate_slug(payload.title)
        
    db.commit()
    db.refresh(post)
    return post
