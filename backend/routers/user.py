from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
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
from schemas.auth_schema import MessageResponse
from schemas.notification_schema import NotificationResponse


router = APIRouter(tags=["Users"])


class ProfileResponse(BaseModel):
    id: str
    username: str
    full_name: str
    avatar_url: str | None
    bio: str | None
    major: str | None
    academic_year: str | None
    career_goal: str | None
    interest_tags: list[str]
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
    major: str | None = None
    academic_year: str | None = None
    career_goal: str | None = None
    interest_tags: list[str] = Field(default_factory=list)


def parse_interest_tags(raw_tags: str | None) -> list[str]:
    if not raw_tags:
        return []
    return [tag for tag in [item.strip() for item in raw_tags.split(",")] if tag]


class UserPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    cover_image: str | None
    status: str | None
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
    posts_count_query = db.query(func.count()).select_from(Post).filter(Post.user_id == user.id, Post.status != "deleted")
    if current_user.id != user.id and current_user.role.lower() != "admin":
        posts_count_query = posts_count_query.filter(Post.status == "active")
    posts_count = posts_count_query.scalar() or 0
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
        major=user.major,
        academic_year=user.academic_year,
        career_goal=user.career_goal,
        interest_tags=parse_interest_tags(user.interest_tags),
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
    current_user.major = payload.major.strip() if payload.major else None
    current_user.academic_year = payload.academic_year.strip() if payload.academic_year else None
    current_user.career_goal = payload.career_goal.strip() if payload.career_goal else None
    current_user.interest_tags = ",".join(dict.fromkeys([tag.strip().lower() for tag in payload.interest_tags if tag.strip()])) or None
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
    query = db.query(Post).filter(Post.user_id == user.id, Post.status != "deleted")
    if current_user.id != user.id and current_user.role.lower() != "admin":
        query = query.filter(Post.status == "active")
    posts = query.order_by(Post.created_at.desc(), Post.id.desc()).all()
    items: list[UserPostResponse] = []
    for post in posts:
        display_title = post.title
        normalized_status = (post.status or "").lower()
        if normalized_status == "pending":
            display_title = f"[Chờ duyệt] {display_title}"
        elif normalized_status == "rejected":
            display_title = f"[Từ chối] {display_title}"
        items.append(
            UserPostResponse(
                id=post.id,
                title=display_title,
                content=post.content,
                cover_image=post.cover_image,
                status=post.status,
                created_at=post.created_at,
            )
        )
    return items


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
        .filter(Comment.user_id == user.id, Comment.status == "active")
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
        .filter(Bookmark.user_id == user.id, Post.status != "deleted")
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


@router.delete("/users/me/notifications/{notification_id}", response_model=MessageResponse)
def delete_read_notification(
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
    if not notification.is_read:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only read notifications can be deleted.")
    db.delete(notification)
    db.commit()
    return MessageResponse(message="Notification deleted successfully.")
