from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies.auth import require_active_verified_user
from models.bookmark import Bookmark
from models.comment import Comment
from models.post import Post
from models.post_like import PostLike
from models.post_share import PostShare
from models.post_tag import PostTag
from models.post_view import PostView
from models.report import Report
from models.tag import Tag
from models.user import User
from schemas.auth_schema import MessageResponse
from schemas.post_schema import PostCreate, PostListResponse, PostResponse, PostUpdate, SharePostRequest
from schemas.report_schema import ReportCreate, ReportResponse
from services.notification_service import create_notification
import json

from services.post_service import (
    build_post_query,
    paginate_latest_posts_fast,
    paginate_query,
    serialize_post,
    split_known_and_new_tags,
    sync_post_tags,
    slugify,
)
from services.report_service import normalize_report_reason



router = APIRouter(prefix="/posts", tags=["Posts"])


def build_stats_for_post(db: Session, post_id: int, current_user_id: str):
    likes_count = db.query(func.count(PostLike.user_id)).filter(PostLike.post_id == post_id).scalar() or 0
    comments_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post_id).scalar() or 0
    views_count = db.query(func.count(PostView.id)).filter(PostView.post_id == post_id).scalar() or 0
    shares_count = db.query(func.count(PostShare.id)).filter(PostShare.post_id == post_id).scalar() or 0
    is_liked = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.user_id == current_user_id)
        .first()
        is not None
    )
    is_bookmarked = (
        db.query(Bookmark)
        .filter(Bookmark.post_id == post_id, Bookmark.user_id == current_user_id)
        .first()
        is not None
    )
    return type(
        "Stats",
        (),
        {
            "likes_count": likes_count,
            "comments_count": comments_count,
            "views_count": views_count,
            "shares_count": shares_count,
            "trending_score": likes_count * 4 + comments_count * 3 + views_count,
            "is_liked": is_liked,
            "is_bookmarked": is_bookmarked,
        },
    )()


def get_post_or_404(db: Session, post_id: int) -> Post:
    post = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    initial_status = "active" if current_user.role.lower() == "admin" else "pending"
    title = payload.title.strip()
    post_slug = slugify(title)

    post = Post(
        user_id=current_user.id,
        title=title,
        slug=post_slug,
        content=payload.content.strip(),
        cover_image=payload.cover_image,
        status=initial_status,
    )
    db.add(post)
    db.flush()
    if current_user.role.lower() == "admin":
        sync_post_tags(db, post, payload.tags, create_missing=True)
        post.requested_new_tags = None
    else:
        known_tags, requested_new_tags = split_known_and_new_tags(db, payload.tags)
        sync_post_tags(db, post, known_tags, create_missing=False)
        post.requested_new_tags = json.dumps(requested_new_tags, ensure_ascii=False) if requested_new_tags else None
    db.commit()
    db.refresh(post)
    post = get_post_or_404(db, post.id)
    stats = type("Stats", (), {"likes_count": 0, "comments_count": 0, "views_count": 0, "shares_count": 0, "trending_score": 0, "is_liked": 0, "is_bookmarked": 0})()
    return serialize_post(post, stats, current_user.id)


@router.get("/feed", response_model=PostListResponse)
def get_posts_feed(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    search: str | None = None,
    tag: str | None = None,
    mode: str = Query(default="for-you", pattern="^(for-you|following|trending)$"),
    sort: str = Query(default="latest", pattern="^(latest|trending|most-liked|most-commented)$"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(require_active_verified_user),
):
    current_user_id = current_user.id if current_user else None

    # Fast path for the most common feed mode to reduce heavy aggregate query cost.
    use_fast_path = sort == "latest" and mode != "trending"
    if use_fast_path:
        rows, pagination = paginate_latest_posts_fast(db, current_user_id, search, tag, mode, page, page_size)
    else:
        query = build_post_query(current_user_id, search, tag, mode, sort)
        rows, pagination = paginate_query(db, query, page, page_size)

    if use_fast_path:
        items = [serialize_post(row[0], row[1], current_user_id) for row in rows]
    else:
        items = [serialize_post(row[0], row, current_user_id) for row in rows]
    return {
        "items": items,
        "meta": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": pagination.total,
            "total_pages": pagination.total_pages,
        },
    }


@router.get("/tags")
def get_tags(db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    _ = current_user.id
    tags = db.query(Tag).order_by(Tag.name.asc()).all()
    return [{"id": tag.id, "name": tag.name, "slug": tag.slug} for tag in tags]


@router.get("/{post_id}", response_model=PostResponse)
def get_post_detail(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    post = get_post_or_404(db, post_id)
    if post.status != "active" and post.user_id != current_user.id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Post is awaiting moderation.")
    db.add(PostView(post_id=post.id, user_id=current_user.id))
    db.commit()
    if post.status != "active":
        stats = build_stats_for_post(db, post.id, current_user.id)
        return serialize_post(post, stats, current_user.id)

    query = build_post_query(current_user.id, None, None, "for-you", "latest").where(Post.id == post_id)
    row = db.execute(query).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return serialize_post(row[0], row, current_user.id)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    post = get_post_or_404(db, post_id)
    if post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"]:
        new_title = update_data["title"].strip()
        post.title = new_title
        post.slug = slugify(new_title)
    if "content" in update_data and update_data["content"] is not None:
        post.content = update_data["content"].strip()
    if "cover_image" in update_data:
        post.cover_image = update_data["cover_image"]
    if "status" in update_data and current_user.role.lower() == "admin":
        post.status = update_data["status"]
    elif current_user.role.lower() != "admin":
        post.status = "pending"
    if "tags" in update_data:
        if current_user.role.lower() == "admin":
            sync_post_tags(db, post, update_data["tags"], create_missing=True)
            post.requested_new_tags = None
        else:
            known_tags, requested_new_tags = split_known_and_new_tags(db, update_data["tags"])
            sync_post_tags(db, post, known_tags, create_missing=False)
            post.requested_new_tags = json.dumps(requested_new_tags, ensure_ascii=False) if requested_new_tags else None

    db.commit()
    if post.status != "active":
        post = get_post_or_404(db, post_id)
        stats = build_stats_for_post(db, post.id, current_user.id)
        return serialize_post(post, stats, current_user.id)

    query = build_post_query(current_user.id, None, None, "for-you", "latest").where(Post.id == post_id)
    row = db.execute(query).first()
    return serialize_post(row[0], row, current_user.id)


@router.delete("/{post_id}", response_model=MessageResponse)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    post = get_post_or_404(db, post_id)
    if post.user_id != current_user.id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post.")

    comment_count = db.query(Comment).filter(Comment.post_id == post.id).count()
    if comment_count and current_user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete a post that already has comments.")

    db.delete(post)
    db.commit()
    return MessageResponse(message="Post deleted successfully.")


@router.post("/{post_id}/like", response_model=MessageResponse)
def toggle_like(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    post = get_post_or_404(db, post_id)
    existing = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return MessageResponse(message="Post unliked successfully.")

    db.add(PostLike(post_id=post.id, user_id=current_user.id))
    if post.user_id != current_user.id:
        create_notification(
            db,
            user_id=post.user_id,
            actor_id=current_user.id,
            notification_type="post_like",
            title="Your post was liked",
            message=f"{current_user.username} liked your post.",
            post_id=post.id,
        )
    db.commit()
    return MessageResponse(message="Post liked successfully.")


@router.post("/{post_id}/bookmark", response_model=MessageResponse)
def toggle_bookmark(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    _ = get_post_or_404(db, post_id)
    existing = db.query(Bookmark).filter(Bookmark.user_id == current_user.id, Bookmark.post_id == post_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return MessageResponse(message="Unbookmarked successfully.")

    db.add(Bookmark(user_id=current_user.id, post_id=post_id))
    db.commit()
    return MessageResponse(message="Bookmarked successfully.")


@router.post("/{post_id}/share", response_model=MessageResponse)
def share_post(
    post_id: int,
    payload: SharePostRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_verified_user),
):
    post = get_post_or_404(db, post_id)
    db.add(PostShare(post_id=post.id, user_id=current_user.id))

    initial_status = "active" if current_user.role.lower() == "admin" else "pending"
    share_caption = payload.caption.strip() if payload and payload.caption else None
    shared_title = f"Shared: {post.title}"
    attribution = f"Shared from @{post.author.username or post.author.id} • Original post #{post.id}"
    shared_content = (
        f"{share_caption}\n\n{attribution}\n\n{post.content}" if share_caption else f"{attribution}\n\n{post.content}"
    )
    shared_post = Post(
        user_id=current_user.id,
        title=shared_title,
        slug=slugify(f"share-{post.id}-{current_user.id}-{shared_title}")[:255],
        content=shared_content,
        cover_image=post.cover_image,
        status=initial_status,
        original_post_id=post.id,
        share_caption=share_caption,
    )
    db.add(shared_post)
    db.flush()
    sync_post_tags(db, shared_post, [association.tag.name for association in post.tags if association.tag])
    db.commit()

    if post.user_id != current_user.id:
        create_notification(
            db,
            user_id=post.user_id,
            actor_id=current_user.id,
            notification_type="post_share",
            title="Your post was shared",
            message=f"{current_user.username} shared your post.",
            post_id=post.id,
        )
        db.commit()

    return MessageResponse(message=f"/post/{shared_post.id}")


@router.post("/{post_id}/report", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def report_post(post_id: int, payload: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    _ = get_post_or_404(db, post_id)
    duplicate = (
        db.query(Report)
        .filter(Report.reporter_id == current_user.id, Report.post_id == post_id, Report.comment_id.is_(None))
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already reported this post.")
    report = Report(
        reporter_id=current_user.id,
        post_id=post_id,
        reason=normalize_report_reason(payload.reason),
        details=payload.details.strip() if payload.details else None,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
