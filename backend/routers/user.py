from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_active_verified_user
from models.bookmark import Bookmark
from models.comment import Comment
from models.follow import Follow
from models.notification import Notification
from models.post import Post
from models.user import User
from schemas.notification_schema import NotificationResponse


router = APIRouter(tags=["Users"])


class ProfileResponse(BaseModel):
    id: str
    username: str
    full_name: str
    avatar_url: str | None
    bio: str | None
    followers_count: int
    following_count: int
    posts_count: int
    is_following: bool
    is_current_user: bool


class CurrentProfileResponse(ProfileResponse):
    email: str
    role: str
    status: str
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    full_name: str
    bio: str | None = None
    avatar_url: str | None = None


class UserPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    cover_image: str | None
    created_at: datetime


class UserCommentResponse(BaseModel):
    id: int
    post_id: int
    post_title: str | None
    content: str
    created_at: datetime


def get_user_by_username_or_404(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def build_profile_response(user: User, current_user: User, db: Session) -> ProfileResponse:
    followers_count = db.query(func.count()).select_from(Follow).filter(Follow.following_id == user.id).scalar() or 0
    following_count = db.query(func.count()).select_from(Follow).filter(Follow.follower_id == user.id).scalar() or 0
    posts_count = db.query(func.count()).select_from(Post).filter(Post.user_id == user.id).scalar() or 0
    is_following = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == user.id)
        .first()
        is not None
    )

    return ProfileResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        followers_count=followers_count,
        following_count=following_count,
        posts_count=posts_count,
        is_following=is_following,
        is_current_user=current_user.id == user.id,
    )


@router.get("/users/me", response_model=CurrentProfileResponse)
def get_my_profile(current_user: User = Depends(require_active_verified_user), db: Session = Depends(get_db)):
    profile = build_profile_response(current_user, current_user, db)
    return CurrentProfileResponse(
        email=current_user.email,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at,
        **profile.model_dump(),
    )


@router.put("/users/me", response_model=CurrentProfileResponse)
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = payload.full_name.strip()
    current_user.bio = payload.bio.strip() if payload.bio else None
    current_user.avatar_url = payload.avatar_url.strip() if payload.avatar_url else None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    profile = build_profile_response(current_user, current_user, db)
    return CurrentProfileResponse(
        email=current_user.email,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at,
        **profile.model_dump(),
    )


@router.get("/users/{username}", response_model=ProfileResponse)
def get_user_profile(
    username: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    user = get_user_by_username_or_404(username, db)
    return build_profile_response(user, current_user, db)


@router.get("/users/{username}/posts", response_model=list[UserPostResponse])
def get_user_posts(
    username: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    user = get_user_by_username_or_404(username, db)
    _ = current_user.id
    return (
        db.query(Post)
        .filter(Post.user_id == user.id)
        .order_by(Post.created_at.desc(), Post.id.desc())
        .all()
    )


@router.get("/users/{username}/comments", response_model=list[UserCommentResponse])
def get_user_comments(
    username: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    user = get_user_by_username_or_404(username, db)
    _ = current_user.id
    rows = (
        db.query(Comment, Post.title.label("post_title"))
        .outerjoin(Post, Post.id == Comment.post_id)
        .filter(Comment.user_id == user.id)
        .order_by(Comment.created_at.desc(), Comment.id.desc())
        .all()
    )
    return [
        UserCommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            post_title=post_title,
            content=comment.content,
            created_at=comment.created_at,
        )
        for comment, post_title in rows
    ]


@router.get("/users/{username}/bookmarks", response_model=list[UserPostResponse])
def get_user_bookmarks(
    username: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    user = get_user_by_username_or_404(username, db)
    if user.id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view your own bookmarks.")

    return (
        db.query(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .filter(Bookmark.user_id == user.id)
        .order_by(Bookmark.created_at.desc(), Post.id.desc())
        .all()
    )


@router.get("/users/me/notifications", response_model=list[NotificationResponse])
def get_my_notifications(
    unread_only: bool = Query(default=False),
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    return query.order_by(Notification.created_at.desc(), Notification.id.desc()).all()


@router.post("/users/me/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
