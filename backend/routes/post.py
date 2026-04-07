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
def get_posts_feed(
    search: Optional[str] = None, 
    tag_name: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    query = db.query(Post).filter(Post.status == "active")
    if search:
        query = query.filter(or_(Post.title.contains(search), Post.content.contains(search)))
    if tag_name:
        query = query.join(Post.tags).filter(Tag.name == tag_name)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

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


from models.bookmark import Bookmark
@router.post("/{post_id}/bookmark")
def toggle_bookmark(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Kiểm tra bài viết tồn tại không
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Toggle logic: Nếu đã bookmark thì xóa, chưa thì thêm
    existing = db.query(Bookmark).filter(Bookmark.user_id == current_user.id, Bookmark.post_id == post_id).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Unbookmarked successfully"}
    
    new_bookmark = Bookmark(user_id=current_user.id, post_id=post_id)
    db.add(new_bookmark)
    db.commit()
    return {"message": "Bookmarked successfully"}

@router.get("/{post_id}/share")
def share_post(post_id: int, db: Session = Depends(get_db)):
    # Share đơn giản là trả về link bài viết dựa trên slug
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    share_url = f"https://yourforum.com/posts/{post.slug}"
    return {"share_url": share_url}
    
@router.get("/{slug}", response_model=PostResponse)
def get_post_detail(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Logic tăng lượt xem mỗi lần click
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Kiểm tra quyền: Chỉ chủ bài viết mới được xóa
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    db.delete(post)
    db.commit()
    return None
