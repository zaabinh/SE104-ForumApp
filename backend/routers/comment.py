from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies.auth import require_active_verified_user
from models.comment import Comment
from models.post import Post
from models.report import Report
from models.user import User
from schemas.comment_schema import CommentCreate, CommentResponse
from schemas.report_schema import ReportCreate, ReportResponse
from services.notification_service import create_notification


router = APIRouter(prefix="/posts/{post_id}/comments", tags=["Comments"])


def build_comment_tree(comments: list[Comment]) -> list[Comment]:
    by_parent: dict[int | None, list[Comment]] = {}
    for comment in comments:
        by_parent.setdefault(comment.parent_id, []).append(comment)
    for siblings in by_parent.values():
        siblings.sort(key=lambda item: (item.created_at, item.id))
    for comment in comments:
        comment.replies = by_parent.get(comment.id, [])
    return by_parent.get(None, [])


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_verified_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    parent_comment = None
    if payload.parent_id is not None:
        parent_comment = db.query(Comment).filter(Comment.id == payload.parent_id, Comment.post_id == post_id).first()
        if not parent_comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found.")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.content.strip(),
        parent_id=payload.parent_id,
    )
    db.add(comment)
    if post.user_id != current_user.id:
        create_notification(
            db,
            user_id=post.user_id,
            actor_id=current_user.id,
            notification_type="comment",
            title="New comment on your post",
            message=f"{current_user.username} commented on your post.",
            post_id=post_id,
        )
    if parent_comment and parent_comment.user_id != current_user.id:
        create_notification(
            db,
            user_id=parent_comment.user_id,
            actor_id=current_user.id,
            notification_type="reply",
            title="New reply to your comment",
            message=f"{current_user.username} replied to your comment.",
            post_id=post_id,
            comment_id=parent_comment.id,
        )
    db.commit()
    db.refresh(comment)
    comment = db.query(Comment).options(joinedload(Comment.author)).filter(Comment.id == comment.id).first()
    comment.replies = []
    return comment


@router.get("/", response_model=list[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    _ = current_user.id
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )
    return build_comment_tree(comments)


@router.post("/{comment_id}/report", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def report_comment(
    post_id: int,
    comment_id: int,
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_verified_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.post_id == post_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    report = Report(
        reporter_id=current_user.id,
        post_id=post_id,
        comment_id=comment_id,
        reason=payload.reason.strip(),
        details=payload.details.strip() if payload.details else None,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
