from fastapi import APIRouter, Depends, HTTPException, Query, status
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
from schemas.post_schema import PostCreate, PostListResponse, PostResponse, PostUpdate
from schemas.report_schema import ReportCreate, ReportResponse
from schemas.trending_schema import (
    TrendingPostListResponse,
    TrendingPostResponse,
    TrendingTagListResponse,
    SimilarPostListResponse,
    SimilarPostResponse,
    CollaborativePostListResponse,
    CollaborativePostResponse,
)
from services.notification_service import create_notification
from services.post_service import build_post_query, paginate_latest_posts_fast, paginate_query, serialize_post, sync_post_tags
from services.report_service import normalize_report_reason
from services.trending_service import get_trending_posts, get_trending_tags, get_similar_posts
from services.collaborative_filtering_service import get_collaborative_recommendations
from datetime import datetime


router = APIRouter(prefix="/posts", tags=["Posts"])


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
    post = Post(
        user_id=current_user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        cover_image=payload.cover_image,
        status=initial_status,
    )
    db.add(post)
    db.flush()
    sync_post_tags(db, post, payload.tags)
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
        post.title = update_data["title"].strip()
    if "content" in update_data and update_data["content"] is not None:
        post.content = update_data["content"].strip()
    if "cover_image" in update_data:
        post.cover_image = update_data["cover_image"]
    if "status" in update_data and current_user.role.lower() == "admin":
        post.status = update_data["status"]
    elif current_user.role.lower() != "admin":
        post.status = "pending"
    if "tags" in update_data:
        sync_post_tags(db, post, update_data["tags"])

    db.commit()
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
def share_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_active_verified_user)):
    post = get_post_or_404(db, post_id)
    db.add(PostShare(post_id=post.id, user_id=current_user.id))
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
    return MessageResponse(message=f"/post/{post.id}")


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


@router.get("/trending/suggestions", response_model=TrendingPostListResponse)
def get_trending_suggestions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    hours: int = Query(default=24, ge=1, le=168),
    tag: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(require_active_verified_user),
):
    """
    Lấy danh sách bài viết gợi ý theo xu hướng.

    - **page**: Trang hiện tại (mặc định 1)
    - **page_size**: Số bài mỗi trang (mặc định 10, tối đa 50)
    - **hours**: Lấy bài viết trong bao nhiêu giờ qua (mặc định 24, tối đa 168)
    - **tag**: Lọc theo tag cụ thể (nếu có)

    Ví dụ:
    - GET /posts/trending/suggestions → Top 10 trending posts 24h
    - GET /posts/trending/suggestions?hours=7&page_size=20 → Top 20 trending posts 7 ngày
    - GET /posts/trending/suggestions?tag=python → Trending posts về Python
    """
    current_user_id = current_user.id if current_user else None

    posts_with_scores, pagination = get_trending_posts(
        db=db,
        current_user_id=current_user_id,
        page=page,
        page_size=page_size,
        hours=hours,
        tag_filter=tag,
        user_personalize=True
    )

    items = []
    for idx, post_data in enumerate(posts_with_scores, start=1):
        post = post_data["post"]

        # Tạo stats object
        stats = type("Stats", (), {
            "likes_count": post_data["likes"],
            "comments_count": post_data["comments"],
            "views_count": post_data["views"],
            "shares_count": post_data["shares"],
            "trending_score": int(post_data["score"]),
            "is_liked": post_data["is_liked"],
            "is_bookmarked": post_data["is_bookmarked"]
        })()

        # Serialize post
        post_response = serialize_post(post, stats, current_user_id)

        # Tạo trending response
        trending_response = TrendingPostResponse(
            post=post_response,
            trend_rank=(page - 1) * page_size + idx,
            hot_score=post_data["score"],
            trending_reason=post_data["reason"]
        )
        items.append(trending_response)

    return {
        "items": items,
        "meta": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": pagination.total,
            "total_pages": pagination.total_pages,
        },
    }


@router.get("/trending/tags", response_model=TrendingTagListResponse)
def get_trending_tags_endpoint(
    limit: int = Query(default=10, ge=1, le=50),
    hours: int = Query(default=24, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(require_active_verified_user),
):
    """
    Lấy danh sách tag đang xu hướng.

    - **limit**: Số tag trả về (mặc định 10, tối đa 50)
    - **hours**: Xem xét bài viết trong bao nhiêu giờ qua (mặc định 24)

    Ví dụ:
    - GET /posts/trending/tags → Top 10 trending tags
    - GET /posts/trending/tags?limit=20&hours=7 → Top 20 tags trong 7 ngày
    """
    _ = current_user  # Đảm bảo user đã xác thực

    trending_tags = get_trending_tags(db, limit=limit, hours=hours)

    return {
        "items": trending_tags,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.get("/{post_id}/similar", response_model=SimilarPostListResponse)
def get_similar_posts_endpoint(
    post_id: int,
    limit: int = Query(default=5, ge=1, le=20),
    min_similarity: float = Query(default=0.1, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_verified_user),
):
    """
    Lấy danh sách bài viết tương tự dựa trên nội dung (Content-Based Filtering).

    Thuật toán:
    - So sánh tiêu đề, nội dung, và tags
    - Sử dụng TF (Term Frequency) và Cosine Similarity
    - Weighted: title(20%) + content(40%) + tags(40%)

    Parameters:
    - **post_id**: ID bài viết tham chiếu (bắt buộc)
    - **limit**: Số bài tương tự trả về (mặc định 5, tối đa 20)
    - **min_similarity**: Điểm tương đồng tối thiểu (mặc định 0.1, từ 0 tới 1)

    Ví dụ:
    - GET /posts/1/similar → 5 bài tương tự bài #1
    - GET /posts/1/similar?limit=10&min_similarity=0.2 → 10 bài có tương đồng ≥ 0.2
    """
    similar_posts_data = get_similar_posts(
        db=db,
        post_id=post_id,
        current_user_id=current_user.id,
        limit=limit,
        min_similarity=min_similarity
    )

    items = []
    for item in similar_posts_data:
        post = item["post"]
        post_response = serialize_post(post, item["stats"], current_user.id)

        similar_response = SimilarPostResponse(
            post=post_response,
            similarity_score=round(item["similarity"], 3),
            similarity_reason=item["reason"]
        )
        items.append(similar_response)

    return {
        "items": items,
        "meta": {
            "page": 1,
            "page_size": len(items),
            "total": len(items),
            "total_pages": 1,
        },
    }


@router.get("/recommendations/collaborative", response_model=CollaborativePostListResponse)
def get_collaborative_recommendations_endpoint(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    min_similarity: float = Query(default=0.2, ge=0.0, le=1.0),
    days_back: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_verified_user),
):
    """
    Lấy gợi ý bài viết dựa trên Collaborative Filtering (User-Based).

    Thuật toán:
    1. Tìm những user có sở thích giống bạn dựa trên:
       - Interest tags (30%)
       - Bài viết yêu thích (35%)
       - Những user đang theo dõi (25%)
       - Bài viết đã comment (10%)

    2. Lấy những bài mà những user này yêu thích
    3. Gợi ý những bài bạn chưa thích/xem

    Parameters:
    - **page**: Trang hiện tại (mặc định 1)
    - **page_size**: Bài mỗi trang (mặc định 10, tối đa 50)
    - **min_similarity**: Điểm tương đồng tối thiểu (mặc định 0.2, từ 0 tới 1)
    - **days_back**: Xem xét bài viết trong bao nhiêu ngày (mặc định 30, tối đa 365)

    Ví dụ:
    - GET /posts/recommendations/collaborative → Top 10 gợi ý
    - GET /posts/recommendations/collaborative?page_size=20&days_back=7 → 20 bài trong 7 ngày
    - GET /posts/recommendations/collaborative?min_similarity=0.3 → Chỉ những user rất tương tự
    """
    collab_posts, pagination = get_collaborative_recommendations(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        min_similarity=min_similarity,
        days_back=days_back
    )

    items = []
    for item in collab_posts:
        post = item["post"]
        post_response = serialize_post(post, item["stats"], current_user.id)

        collab_response = CollaborativePostResponse(
            post=post_response,
            cf_score=round(item["cf_score"], 3),
            cf_reason=item["reason"],
            similar_user_count=0  # TODO: Thêm vào service
        )
        items.append(collab_response)

    return {
        "items": items,
        "meta": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": pagination.total,
            "total_pages": pagination.total_pages,
        },
    }
