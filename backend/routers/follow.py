from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_active_verified_user
from models.follow import Follow
from models.user import User
from services.notification_service import create_notification


router = APIRouter(tags=["Follows"])


class FollowResponse(BaseModel):
    message: str
    following: bool


@router.post("/follow/{user_id}", response_model=FollowResponse, status_code=status.HTTP_201_CREATED)
def follow_user(
    user_id: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    existing_follow = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == user_id)
        .first()
    )
    if existing_follow:
        return FollowResponse(message="Already following this user.", following=True)

    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    create_notification(
        db,
        user_id=user_id,
        actor_id=current_user.id,
        notification_type="follow",
        title="You have a new follower",
        message=f"{current_user.username} started following you.",
    )
    db.commit()
    return FollowResponse(message="Followed user successfully.", following=True)


@router.delete("/follow/{user_id}", response_model=FollowResponse)
def unfollow_user(
    user_id: str,
    current_user: User = Depends(require_active_verified_user),
    db: Session = Depends(get_db),
):
    follow = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == user_id)
        .first()
    )
    if not follow:
        return FollowResponse(message="You are not following this user.", following=False)

    db.delete(follow)
    db.commit()
    return FollowResponse(message="Unfollowed user successfully.", following=False)
