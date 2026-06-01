"""
Service để gợi ý bài viết theo xu hướng
"""
from datetime import datetime, timedelta
import math
from types import SimpleNamespace
import re
from collections import Counter

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload

from models.comment import Comment
from models.follow import Follow
from models.post import Post
from models.post_like import PostLike
from models.post_share import PostShare
from models.post_tag import PostTag
from models.post_view import PostView
from models.tag import Tag
from models.user import User
from models.bookmark import Bookmark
from services.post_service import Pagination, serialize_post


def calculate_time_decay(created_at: datetime, hours_old: float = 24) -> float:
    """
    Tính decay score dựa trên tuổi của bài viết.
    Bài viết mới nhất = 1.0, bài viết cũ = 0.1
    """
    now = datetime.utcnow()
    age_hours = (now - created_at).total_seconds() / 3600

    if age_hours < 0:
        return 1.0

    # Exponential decay: e^(-age/24)
    decay = math.exp(-age_hours / hours_old)
    return max(0.1, min(1.0, decay))  # Giữa 0.1 - 1.0


def calculate_trending_score(
    likes_count: int,
    comments_count: int,
    views_count: int,
    shares_count: int,
    created_at: datetime,
    decay_factor: bool = True
) -> float:
    """
    Tính điểm xu hướng của bài viết.

    Công thức:
    - Cơ sở: likes*4 + comments*3 + views*0.5 + shares*2
    - Nếu decay_factor=True: nhân với time decay
    """
    base_score = (
        likes_count * 4 +
        comments_count * 3 +
        views_count * 0.5 +
        shares_count * 2
    )

    if decay_factor:
        time_decay = calculate_time_decay(created_at)
        return base_score * time_decay

    return base_score


def get_trending_reason(
    likes_count: int,
    comments_count: int,
    views_count: int,
    shares_count: int
) -> str:
    """Xác định lý do bài viết trending"""
    stats = [
        ("yêu thích", likes_count),
        ("bình luận", comments_count),
        ("chia sẻ", shares_count),
        ("lượt xem", views_count)
    ]

    # Sắp xếp theo giá trị giảm dần
    stats.sort(key=lambda x: x[1], reverse=True)

    if stats[0][1] > 0:
        return f"Nổi bật do {stats[0][0]}"
    return "Bài viết mới"


def get_trending_posts(
    db: Session,
    current_user_id: str | None,
    page: int = 1,
    page_size: int = 10,
    hours: int = 24,
    tag_filter: str | None = None,
    user_personalize: bool = True
) -> tuple[list, Pagination]:
    """
    Lấy danh sách bài viết trending.

    Args:
        db: Database session
        current_user_id: ID user hiện tại (nếu có)
        page: Số trang
        page_size: Số bài mỗi trang
        hours: Lấy bài viết trong bao nhiêu giờ qua (mặc định 24)
        tag_filter: Lọc theo tag cụ thể (nếu có)
        user_personalize: Personalize theo interest_tags của user

    Returns:
        (danh sách bài viết, pagination info)
    """
    page = max(1, page)
    page_size = min(max(1, page_size), 50)

    # Tính thời gian bắt đầu
    time_threshold = datetime.utcnow() - timedelta(hours=hours)

    # Tạo query lấy stats của bài viết
    likes_count = func.count(func.distinct(PostLike.user_id)).label("likes_count")
    comments_count = func.count(func.distinct(Comment.id)).label("comments_count")
    views_count = func.count(func.distinct(PostView.id)).label("views_count")
    shares_count = func.count(func.distinct(PostShare.id)).label("shares_count")

    query = (
        select(Post)
        .outerjoin(PostLike, PostLike.post_id == Post.id)
        .outerjoin(Comment, Comment.post_id == Post.id)
        .outerjoin(PostView, PostView.post_id == Post.id)
        .outerjoin(PostShare, PostShare.post_id == Post.id)
        .where(
            and_(
                Post.status == "active",
                Post.created_at >= time_threshold
            )
        )
        .group_by(Post.id)
    )

    # Nếu có tag_filter, join với tag
    if tag_filter:
        query = query.join(PostTag, PostTag.post_id == Post.id).join(
            Tag, Tag.id == PostTag.tag_id
        ).where(Tag.name.ilike(f"%{tag_filter}%"))

    # Lấy tổng số bài viết
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()

    # Offset và limit
    offset = (page - 1) * page_size

    # Lấy bài viết
    posts = db.execute(
        query.order_by(Post.created_at.desc()).offset(offset).limit(page_size)
    ).scalars().all()

    # Load relationships
    for post in posts:
        db.refresh(post, ["author", "tags", "likes", "comments", "views", "shares"])

    if not posts:
        return [], Pagination(page=page, page_size=page_size, total=total)

    post_ids = [p.id for p in posts]

    # Lấy stats cho mỗi bài viết
    likes_map = dict(
        db.query(PostLike.post_id, func.count())
        .filter(PostLike.post_id.in_(post_ids))
        .group_by(PostLike.post_id)
        .all()
    )
    comments_map = dict(
        db.query(Comment.post_id, func.count())
        .filter(Comment.post_id.in_(post_ids))
        .group_by(Comment.post_id)
        .all()
    )
    views_map = dict(
        db.query(PostView.post_id, func.count())
        .filter(PostView.post_id.in_(post_ids))
        .group_by(PostView.post_id)
        .all()
    )
    shares_map = dict(
        db.query(PostShare.post_id, func.count())
        .filter(PostShare.post_id.in_(post_ids))
        .group_by(PostShare.post_id)
        .all()
    )

    # Lấy liked/bookmarked set của user
    liked_set = set()
    bookmarked_set = set()
    if current_user_id:
        liked_set = {
            post_id
            for (post_id,) in db.query(PostLike.post_id)
            .filter(PostLike.user_id == current_user_id, PostLike.post_id.in_(post_ids))
            .all()
        }
        bookmarked_set = {
            post_id
            for (post_id,) in db.query(Bookmark.post_id)
            .filter(Bookmark.user_id == current_user_id, Bookmark.post_id.in_(post_ids))
            .all()
        }

    # Tính trending score cho mỗi bài viết
    posts_with_scores = []
    for post in posts:
        likes = int(likes_map.get(post.id, 0))
        comments = int(comments_map.get(post.id, 0))
        views = int(views_map.get(post.id, 0))
        shares = int(shares_map.get(post.id, 0))

        score = calculate_trending_score(likes, comments, views, shares, post.created_at)
        reason = get_trending_reason(likes, comments, views, shares)

        posts_with_scores.append({
            "post": post,
            "likes": likes,
            "comments": comments,
            "views": views,
            "shares": shares,
            "score": score,
            "reason": reason,
            "is_liked": post.id in liked_set,
            "is_bookmarked": post.id in bookmarked_set
        })

    # Sắp xếp theo score giảm dần
    posts_with_scores.sort(key=lambda x: x["score"], reverse=True)

    return posts_with_scores, Pagination(page=page, page_size=page_size, total=total)


def get_trending_tags(
    db: Session,
    limit: int = 10,
    hours: int = 24
) -> list[dict]:
    """
    Lấy danh sách tag đang xu hướng.

    Args:
        db: Database session
        limit: Số tag trả về
        hours: Xem xét bài viết trong bao nhiêu giờ qua

    Returns:
        Danh sách tag trending
    """
    time_threshold = datetime.utcnow() - timedelta(hours=hours)

    # Query lấy tag và số bài viết
    trending_tags = (
        db.query(
            Tag.name,
            func.count(func.distinct(Post.id)).label("post_count"),
            func.sum(
                func.count(func.distinct(PostLike.user_id)) * 4 +
                func.count(func.distinct(Comment.id)) * 3 +
                func.count(func.distinct(PostView.id))
            ).label("trend_score")
        )
        .join(PostTag, PostTag.tag_id == Tag.id)
        .join(Post, Post.id == PostTag.post_id)
        .outerjoin(PostLike, PostLike.post_id == Post.id)
        .outerjoin(Comment, Comment.post_id == Post.id)
        .outerjoin(PostView, PostView.post_id == Post.id)
        .where(
            and_(
                Post.status == "active",
                Post.created_at >= time_threshold
            )
        )
        .group_by(Tag.id, Tag.name)
        .order_by(func.sum(
            func.count(func.distinct(PostLike.user_id)) * 4 +
            func.count(func.distinct(Comment.id)) * 3 +
            func.count(func.distinct(PostView.id))
        ).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "tag_name": tag_name,
            "post_count": post_count or 0,
            "trend_score": float(trend_score or 0)
        }
        for tag_name, post_count, trend_score in trending_tags
    ]


# ============================================================
# CONTENT-BASED FILTERING (Gợi ý theo nội dung tương đồng)
# ============================================================


def preprocess_text(text: str) -> list[str]:
    """
    Chuẩn hóa text: chuyển thành lowercase, loại bỏ ký tự đặc biệt.
    Trả về danh sách từ khóa.
    """
    if not text:
        return []

    text = text.lower()
    # Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số và khoảng trắng
    text = re.sub(r"[^\w\s]", " ", text)
    # Loại bỏ khoảng trắng dôi dư
    words = text.split()

    # Loại bỏ stop words tiếng Việt/Anh phổ biến
    stop_words = {
        "the", "a", "an", "is", "are", "in", "on", "at", "to", "for", "of",
        "và", "hay", "hoặc", "là", "với", "cái", "chiếc", "những"
    }

    return [word for word in words if word not in stop_words and len(word) > 2]


def calculate_tag_similarity(post1_tags: set[str], post2_tags: set[str]) -> float:
    """
    Tính độ tương đồng giữa 2 tập tag sử dụng Jaccard similarity.
    Công thức: |A ∩ B| / |A ∪ B|
    """
    if not post1_tags and not post2_tags:
        return 0.0

    if not post1_tags or not post2_tags:
        return 0.0

    intersection = len(post1_tags & post2_tags)
    union = len(post1_tags | post2_tags)

    return intersection / union if union > 0 else 0.0


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Tính độ tương đồng giữa 2 đoạn text sử dụng TF (Term Frequency).
    Đơn giản hơn TF-IDF, dùng Cosine Similarity.
    """
    if not text1 or not text2:
        return 0.0

    words1 = preprocess_text(text1)
    words2 = preprocess_text(text2)

    if not words1 or not words2:
        return 0.0

    # Tạo vector tần suất
    freq1 = Counter(words1)
    freq2 = Counter(words2)

    # Tính dot product
    dot_product = sum(freq1[word] * freq2[word] for word in freq1 if word in freq2)

    # Tính magnitude
    magnitude1 = math.sqrt(sum(freq**2 for freq in freq1.values()))
    magnitude2 = math.sqrt(sum(freq**2 for freq in freq2.values()))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    # Cosine similarity
    return dot_product / (magnitude1 * magnitude2)


def calculate_content_similarity(
    post1: Post,
    post2: Post,
    weights: dict | None = None
) -> tuple[float, str]:
    """
    Tính độ tương đồng toàn bộ giữa 2 bài viết.

    Args:
        post1: Bài viết 1
        post2: Bài viết 2
        weights: Trọng số cho từng thành phần
                 {'title': 0.3, 'content': 0.3, 'tags': 0.4}

    Returns:
        (similarity_score, reason)
    """
    if weights is None:
        weights = {"title": 0.2, "content": 0.4, "tags": 0.4}

    # Tương đồng title
    title_sim = calculate_text_similarity(post1.title, post2.title)

    # Tương đồng content
    content_sim = calculate_text_similarity(post1.content, post2.content)

    # Tương đồng tags
    tags1 = {tag.tag.name.lower() for tag in post1.tags if tag.tag}
    tags2 = {tag.tag.name.lower() for tag in post2.tags if tag.tag}
    tags_sim = calculate_tag_similarity(tags1, tags2)

    # Tính weighted average
    similarity = (
        weights["title"] * title_sim +
        weights["content"] * content_sim +
        weights["tags"] * tags_sim
    )

    # Xác định lý do
    reason = ""
    if tags_sim > 0.3:
        reason = "Cùng chủ đề"
    elif content_sim > 0.2:
        reason = "Nội dung tương tự"
    elif title_sim > 0.1:
        reason = "Tiêu đề liên quan"

    if not reason:
        reason = "Bài viết gợi ý"

    return similarity, reason


def get_similar_posts(
    db: Session,
    post_id: int,
    current_user_id: str | None,
    limit: int = 5,
    min_similarity: float = 0.1
) -> list[dict]:
    """
    Lấy danh sách bài viết tương tự dựa trên nội dung.

    Args:
        db: Database session
        post_id: ID bài viết tham chiếu
        current_user_id: ID user hiện tại
        limit: Số bài trả về
        min_similarity: Điểm tương đồng tối thiểu (0-1)

    Returns:
        Danh sách bài viết tương tự
    """
    limit = min(max(1, limit), 20)
    min_similarity = max(0, min(1, min_similarity))

    # Lấy bài viết gốc
    reference_post = (
        db.query(Post)
        .options(joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(Post.id == post_id, Post.status == "active")
        .first()
    )

    if not reference_post:
        return []

    # Lấy tất cả bài viết active khác
    similar_posts = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(Post.status == "active", Post.id != post_id)
        .all()
    )

    # Tính similarity cho mỗi bài
    posts_with_similarity = []
    for post in similar_posts:
        similarity, reason = calculate_content_similarity(reference_post, post)

        if similarity >= min_similarity:
            posts_with_similarity.append({
                "post": post,
                "similarity": similarity,
                "reason": reason
            })

    # Sắp xếp theo similarity giảm dần
    posts_with_similarity.sort(key=lambda x: x["similarity"], reverse=True)

    # Lấy stats cho các bài
    post_ids = [p["post"].id for p in posts_with_similarity[:limit]]

    if not post_ids:
        return []

    likes_map = dict(
        db.query(PostLike.post_id, func.count())
        .filter(PostLike.post_id.in_(post_ids))
        .group_by(PostLike.post_id)
        .all()
    )
    comments_map = dict(
        db.query(Comment.post_id, func.count())
        .filter(Comment.post_id.in_(post_ids))
        .group_by(Comment.post_id)
        .all()
    )
    views_map = dict(
        db.query(PostView.post_id, func.count())
        .filter(PostView.post_id.in_(post_ids))
        .group_by(PostView.post_id)
        .all()
    )
    shares_map = dict(
        db.query(PostShare.post_id, func.count())
        .filter(PostShare.post_id.in_(post_ids))
        .group_by(PostShare.post_id)
        .all()
    )

    liked_set = set()
    bookmarked_set = set()
    if current_user_id:
        liked_set = {
            post_id
            for (post_id,) in db.query(PostLike.post_id)
            .filter(PostLike.user_id == current_user_id, PostLike.post_id.in_(post_ids))
            .all()
        }
        bookmarked_set = {
            post_id
            for (post_id,) in db.query(Bookmark.post_id)
            .filter(Bookmark.user_id == current_user_id, Bookmark.post_id.in_(post_ids))
            .all()
        }

    # Format kết quả
    result = []
    for item in posts_with_similarity[:limit]:
        post = item["post"]
        likes = int(likes_map.get(post.id, 0))
        comments = int(comments_map.get(post.id, 0))
        views = int(views_map.get(post.id, 0))
        shares = int(shares_map.get(post.id, 0))

        stats = SimpleNamespace(
            likes_count=likes,
            comments_count=comments,
            views_count=views,
            shares_count=shares,
            trending_score=likes * 4 + comments * 3 + views,
            is_liked=post.id in liked_set,
            is_bookmarked=post.id in bookmarked_set
        )

        result.append({
            "post": post,
            "stats": stats,
            "similarity": item["similarity"],
            "reason": item["reason"]
        })

    return result
