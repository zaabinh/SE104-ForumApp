"""
Service phân tích Profile User và gợi ý bài viết liên quan.
Gợi ý dựa trên:
1. Interest tags (quan tâm)
2. Major (chuyên ngành)
3. Academic year (năm học)
4. Career goal (mục tiêu)
5. Bio (tiểu sử)
"""
from datetime import datetime, timedelta
import re
from collections import Counter
from types import SimpleNamespace

from sqlalchemy import and_, func, select, or_
from sqlalchemy.orm import Session, joinedload

from models.post import Post
from models.post_like import PostLike
from models.post_view import PostView
from models.comment import Comment
from models.user import User
from models.post_tag import PostTag
from models.tag import Tag
from models.bookmark import Bookmark
from services.post_service import Pagination


def _parse_tags_from_string(raw_tags: str | None) -> set[str]:
    """Phân tích tags từ chuỗi comma-separated"""
    if not raw_tags:
        return set()
    return {tag.strip().lower() for tag in raw_tags.split(",") if tag.strip()}


def _extract_keywords_from_text(text: str | None, max_words: int = 5) -> list[str]:
    """Trích xuất keywords từ text (loại bỏ stop words)"""
    if not text:
        return []

    # Stop words tiếng Việt/Anh
    stop_words = {
        "the", "a", "an", "is", "are", "in", "on", "at", "to", "for", "of",
        "và", "hay", "hoặc", "là", "với", "cái", "chiếc", "những",
        "em", "bạn", "tôi", "anh", "chị", "nó", "họ"
    }

    # Chuyển thành lowercase, loại bỏ ký tự đặc biệt
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    words = text.split()

    # Lọc stop words và từ quá ngắn
    keywords = [
        word for word in words
        if word not in stop_words and len(word) > 2
    ]

    # Đếm tần suất
    word_freq = Counter(keywords)
    # Lấy top words
    return [word for word, _ in word_freq.most_common(max_words)]


def analyze_user_profile(db: Session, user_id: str) -> dict:
    """
    Phân tích thông tin profile của user.

    Returns:
        {
            "interest_tags": set,
            "major": str,
            "academic_year": str,
            "career_goal": str,
            "keywords": list,
            "liked_tags": set,
            "commented_tags": set
        }
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {}

    # 1. Interest tags
    interest_tags = _parse_tags_from_string(user.interest_tags)

    # 2. Keywords từ Major
    major_keywords = _extract_keywords_from_text(user.major) if user.major else []

    # 3. Keywords từ Career goal
    career_keywords = _extract_keywords_from_text(user.career_goal, max_words=5)

    # 4. Keywords từ Bio
    bio_keywords = _extract_keywords_from_text(user.bio, max_words=3)

    # Merge keywords
    all_keywords = list(set(major_keywords + career_keywords + bio_keywords))

    # 5. Tags từ bài viết user đã like
    liked_tags = {
        tag_name
        for (tag_name,) in db.query(Tag.name)
        .join(PostTag, PostTag.tag_id == Tag.id)
        .join(PostLike, PostLike.post_id == PostTag.post_id)
        .filter(PostLike.user_id == user_id)
        .distinct()
        .all()
    }

    # 6. Tags từ bài viết user đã comment
    commented_tags = {
        tag_name
        for (tag_name,) in db.query(Tag.name)
        .join(PostTag, PostTag.tag_id == Tag.id)
        .join(Comment, Comment.post_id == PostTag.post_id)
        .filter(Comment.user_id == user_id)
        .distinct()
        .all()
    }

    return {
        "interest_tags": interest_tags,
        "major": user.major or "",
        "academic_year": user.academic_year or "",
        "career_goal": user.career_goal or "",
        "keywords": all_keywords,
        "liked_tags": liked_tags,
        "commented_tags": commented_tags,
    }


def calculate_profile_relevance_score(
    post: Post,
    profile_info: dict,
    weights: dict | None = None
) -> tuple[float, str]:
    """
    Tính điểm liên quan giữa bài viết và profile user.

    Trọng số:
    - Tags trực tiếp: 40%
    - Từ khóa text: 30%
    - Hành vi (like/comment): 30%

    Returns:
        (score, reason)
    """
    if weights is None:
        weights = {
            "direct_tags": 0.40,
            "keywords": 0.30,
            "behavior_tags": 0.30
        }

    # Lấy tags của bài viết
    post_tags = {tag.tag.name.lower() for tag in post.tags if tag.tag}

    # 1. Direct tags match (interest_tags)
    interest_tags = profile_info.get("interest_tags", set())
    direct_overlap = len(post_tags & interest_tags)
    max_direct = max(len(post_tags), len(interest_tags)) if (post_tags or interest_tags) else 1
    direct_score = direct_overlap / max_direct if max_direct > 0 else 0

    # 2. Keywords match (từ major, career_goal, bio)
    keywords = set(profile_info.get("keywords", []))
    post_text = (post.title + " " + post.content).lower()
    keyword_matches = sum(1 for kw in keywords if kw in post_text)
    keywords_score = keyword_matches / len(keywords) if keywords else 0

    # 3. Behavior tags (bài user đã like/comment)
    liked_tags = profile_info.get("liked_tags", set())
    commented_tags = profile_info.get("commented_tags", set())
    behavior_tags = liked_tags | commented_tags

    behavior_overlap = len(post_tags & behavior_tags)
    max_behavior = max(len(post_tags), len(behavior_tags)) if (post_tags or behavior_tags) else 1
    behavior_score = behavior_overlap / max_behavior if max_behavior > 0 else 0

    # Weighted score
    score = (
        weights["direct_tags"] * direct_score +
        weights["keywords"] * keywords_score +
        weights["behavior_tags"] * behavior_score
    )

    # Xác định lý do
    reason = ""
    if direct_score > 0.3:
        reason = "Liên quan đến sở thích của bạn"
    elif keyword_matches > 0:
        reason = "Liên quan đến mục tiêu sự nghiệp"
    elif behavior_score > 0.2:
        reason = "Dựa trên bài viết bạn đã yêu thích"
    else:
        reason = "Đề xuất dựa trên profile"

    return score, reason


def get_profile_based_recommendations(
    db: Session,
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    min_score: float = 0.1,
    days_back: int = 30
) -> tuple[list, Pagination]:
    """
    Lấy gợi ý bài viết dựa trên profile user.

    Args:
        db: Database session
        user_id: ID user
        page: Trang hiện tại
        page_size: Bài mỗi trang
        min_score: Điểm liên quan tối thiểu
        days_back: Bài viết trong bao nhiêu ngày qua

    Returns:
        (danh sách bài viết, pagination)
    """
    page = max(1, page)
    page_size = min(max(1, page_size), 50)

    # Phân tích profile
    profile_info = analyze_user_profile(db, user_id)

    if not profile_info:
        return [], Pagination(page=page, page_size=page_size, total=0)

    # Lấy bài viết active trong timeframe
    time_threshold = datetime.utcnow() - timedelta(days=days_back)

    posts = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(
            Post.status == "active",
            Post.created_at >= time_threshold
        )
        .all()
    )

    if not posts:
        return [], Pagination(page=page, page_size=page_size, total=0)

    # Lấy bài user đã like
    user_liked = {
        post_id
        for (post_id,) in db.query(PostLike.post_id)
        .filter(PostLike.user_id == user_id)
        .all()
    }

    # Tính score cho mỗi bài
    posts_with_scores = []

    for post in posts:
        # Bỏ qua những bài user đã like
        if post.id in user_liked:
            continue

        score, reason = calculate_profile_relevance_score(post, profile_info)

        if score >= min_score:
            posts_with_scores.append({
                "post": post,
                "score": score,
                "reason": reason
            })

    # Sắp xếp theo score giảm dần
    posts_with_scores.sort(key=lambda x: x["score"], reverse=True)

    # Pagination
    total = len(posts_with_scores)
    offset = (page - 1) * page_size
    page_data = posts_with_scores[offset:offset + page_size]

    if not page_data:
        return [], Pagination(page=page, page_size=page_size, total=total)

    # Lấy stats
    page_post_ids = [item["post"].id for item in page_data]

    from sqlalchemy import case

    likes_count = func.count(func.distinct(PostLike.user_id)).label("likes_count")
    comments_count = func.count(func.distinct(Comment.id)).label("comments_count")
    views_count = func.count(func.distinct(PostView.id)).label("views_count")
    is_liked = func.max(case((PostLike.user_id == user_id, 1), else_=0)).label("is_liked")
    is_bookmarked = func.max(case((Bookmark.user_id == user_id, 1), else_=0)).label("is_bookmarked")

    stats_query = (
        select(
            Post.id,
            likes_count,
            comments_count,
            views_count,
            is_liked,
            is_bookmarked
        )
        .outerjoin(PostLike, PostLike.post_id == Post.id)
        .outerjoin(Comment, Comment.post_id == Post.id)
        .outerjoin(PostView, PostView.post_id == Post.id)
        .outerjoin(Bookmark, Bookmark.post_id == Post.id)
        .where(Post.id.in_(page_post_ids))
        .group_by(Post.id)
    )

    stats_rows = db.execute(stats_query).all()
    stats_map = {row[0]: row for row in stats_rows}

    # Format result
    result = []
    for item in page_data:
        post = item["post"]
        stats_row = stats_map.get(post.id)

        if stats_row:
            likes = int(stats_row[1] or 0)
            comments = int(stats_row[2] or 0)
            views = int(stats_row[3] or 0)
            is_liked = bool(stats_row[4])
            is_bookmarked = bool(stats_row[5])
        else:
            likes = comments = views = 0
            is_liked = is_bookmarked = False

        stats = SimpleNamespace(
            likes_count=likes,
            comments_count=comments,
            views_count=views,
            shares_count=0,
            trending_score=likes * 4 + comments * 3 + views,
            is_liked=is_liked,
            is_bookmarked=is_bookmarked
        )

        result.append({
            "post": post,
            "stats": stats,
            "profile_score": item["score"],
            "reason": item["reason"]
        })

    return result, Pagination(page=page, page_size=page_size, total=total)


def get_user_profile_summary(db: Session, user_id: str) -> dict:
    """
    Lấy tóm tắt profile của user để hiển thị.

    Returns:
        {
            "interest_tags": list,
            "major": str,
            "academic_year": str,
            "career_goal": str,
            "profile_strength": float,  # 0-1
            "recommendations_count": int
        }
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {}

    profile_info = analyze_user_profile(db, user_id)

    # Tính "profile strength" dựa trên độ đầy đủ thông tin
    completeness_score = 0
    max_score = 5

    if user.interest_tags:
        completeness_score += 1
    if user.major:
        completeness_score += 1
    if user.academic_year:
        completeness_score += 1
    if user.career_goal:
        completeness_score += 1
    if user.bio:
        completeness_score += 1

    profile_strength = completeness_score / max_score

    # Đếm số bài viết có thể recommend
    recommendations_count = (
        db.query(Post)
        .filter(Post.status == "active")
        .filter(Post.id.notin_(
            db.query(PostLike.post_id)
            .filter(PostLike.user_id == user_id)
        ))
        .count()
    )

    return {
        "interest_tags": list(profile_info.get("interest_tags", [])),
        "major": user.major or "",
        "academic_year": user.academic_year or "",
        "career_goal": user.career_goal or "",
        "profile_strength": profile_strength,
        "recommendations_count": recommendations_count,
        "profile_completeness": {
            "has_interest_tags": bool(user.interest_tags),
            "has_major": bool(user.major),
            "has_academic_year": bool(user.academic_year),
            "has_career_goal": bool(user.career_goal),
            "has_bio": bool(user.bio),
        }
    }
