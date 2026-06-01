"""
Service Collaborative Filtering - Gợi ý bài viết dựa trên hành vi của những user tương tự
"""
from datetime import datetime, timedelta
import math
from collections import defaultdict, Counter
from types import SimpleNamespace

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload

from models.post import Post
from models.post_like import PostLike
from models.post_view import PostView
from models.comment import Comment
from models.follow import Follow
from models.bookmark import Bookmark
from models.user import User
from models.post_tag import PostTag
from models.tag import Tag
from services.post_service import Pagination


def _parse_interest_tags(raw_tags: str | None) -> set[str]:
    """Phân tích interest_tags từ string"""
    if not raw_tags:
        return set()
    return {tag.strip().lower() for tag in raw_tags.split(",") if tag.strip()}


def calculate_tag_similarity(tags1: set[str], tags2: set[str]) -> float:
    """
    Tính Jaccard similarity giữa 2 tập tag.
    Công thức: |A ∩ B| / |A ∪ B|
    """
    if not tags1 and not tags2:
        return 0.0
    if not tags1 or not tags2:
        return 0.0

    intersection = len(tags1 & tags2)
    union = len(tags1 | tags2)
    return intersection / union if union > 0 else 0.0


def calculate_post_overlap(
    user1_liked: set[int],
    user2_liked: set[int]
) -> float:
    """
    Tính % overlap giữa bài viết mà 2 user yêu thích.
    Công thức: |A ∩ B| / max(|A|, |B|)
    """
    if not user1_liked and not user2_liked:
        return 0.0
    if not user1_liked or not user2_liked:
        return 0.0

    intersection = len(user1_liked & user2_liked)
    max_size = max(len(user1_liked), len(user2_liked))
    return intersection / max_size if max_size > 0 else 0.0


def calculate_follow_overlap(
    user1_follows: set[str],
    user2_follows: set[str]
) -> float:
    """
    Tính overlap giữa những user mà 2 user theo dõi.
    Công thức: |A ∩ B| / max(|A|, |B|)
    """
    if not user1_follows and not user2_follows:
        return 0.0
    if not user1_follows or not user2_follows:
        return 0.0

    intersection = len(user1_follows & user2_follows)
    max_size = max(len(user1_follows), len(user2_follows))
    return intersection / max_size if max_size > 0 else 0.0


def calculate_user_similarity(
    db: Session,
    user1_id: str,
    user2_id: str,
    weights: dict | None = None
) -> float:
    """
    Tính độ tương đồng giữa 2 user.

    Args:
        db: Database session
        user1_id: ID user 1
        user2_id: ID user 2
        weights: Trọng số cho từng thành phần

    Returns:
        Similarity score (0-1)
    """
    if weights is None:
        weights = {
            "tags": 0.25,
            "posts": 0.35,
            "follows": 0.25,
            "comments": 0.15
        }

    user1 = db.query(User).filter(User.id == user1_id).first()
    user2 = db.query(User).filter(User.id == user2_id).first()

    if not user1 or not user2:
        return 0.0

    # 1. Tag similarity (Interest tags)
    tags1 = _parse_interest_tags(user1.interest_tags)
    tags2 = _parse_interest_tags(user2.interest_tags)
    tag_sim = calculate_tag_similarity(tags1, tags2)

    # 2. Liked posts overlap
    liked1 = {
        post_id
        for (post_id,) in db.query(PostLike.post_id)
        .filter(PostLike.user_id == user1_id)
        .all()
    }
    liked2 = {
        post_id
        for (post_id,) in db.query(PostLike.post_id)
        .filter(PostLike.user_id == user2_id)
        .all()
    }
    posts_sim = calculate_post_overlap(liked1, liked2)

    # 3. Following overlap
    follows1 = {
        follow_id
        for (follow_id,) in db.query(Follow.following_id)
        .filter(Follow.follower_id == user1_id)
        .all()
    }
    follows2 = {
        follow_id
        for (follow_id,) in db.query(Follow.following_id)
        .filter(Follow.follower_id == user2_id)
        .all()
    }
    follows_sim = calculate_follow_overlap(follows1, follows2)

    # 4. Comments overlap (bài viết đã comment)
    comments1 = {
        post_id
        for (post_id,) in db.query(Comment.post_id)
        .filter(Comment.user_id == user1_id)
        .distinct()
        .all()
    }
    comments2 = {
        post_id
        for (post_id,) in db.query(Comment.post_id)
        .filter(Comment.user_id == user2_id)
        .distinct()
        .all()
    }
    comments_sim = calculate_post_overlap(comments1, comments2)

    # Weighted sum
    similarity = (
        weights["tags"] * tag_sim +
        weights["posts"] * posts_sim +
        weights["follows"] * follows_sim +
        weights["comments"] * comments_sim
    )

    return max(0.0, min(1.0, similarity))


def find_similar_users(
    db: Session,
    user_id: str,
    limit: int = 10,
    min_similarity: float = 0.2
) -> list[tuple[str, float]]:
    """
    Tìm những user tương tự với user hiện tại.

    Args:
        db: Database session
        user_id: ID user hiện tại
        limit: Số user trả về
        min_similarity: Điểm tương đồng tối thiểu

    Returns:
        Danh sách (user_id, similarity_score)
    """
    # Lấy tất cả user khác (limit 500 để tối ưu)
    all_users = (
        db.query(User.id)
        .filter(User.id != user_id, User.status == "active")
        .limit(500)
        .all()
    )

    user_similarities = []

    for (other_user_id,) in all_users:
        similarity = calculate_user_similarity(db, user_id, other_user_id)

        if similarity >= min_similarity:
            user_similarities.append((other_user_id, similarity))

    # Sắp xếp theo similarity giảm dần
    user_similarities.sort(key=lambda x: x[1], reverse=True)

    return user_similarities[:limit]


def get_collaborative_recommendations(
    db: Session,
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    min_similarity: float = 0.2,
    days_back: int = 30
) -> tuple[list, Pagination]:
    """
    Lấy gợi ý bài viết dựa trên Collaborative Filtering.

    Thuật toán:
    1. Tìm user tương tự (user có sở thích giống)
    2. Lấy những bài mà những user tương tự yêu thích
    3. Loại bỏ những bài user hiện tại đã like/view
    4. Sắp xếp theo weighted score

    Args:
        db: Database session
        user_id: ID user hiện tại
        page: Số trang
        page_size: Bài mỗi trang
        min_similarity: Điểm tương đồng tối thiểu
        days_back: Xem xét bài viết trong bao nhiêu ngày qua

    Returns:
        (danh sách bài viết, pagination info)
    """
    page = max(1, page)
    page_size = min(max(1, page_size), 50)

    # Tìm user tương tự
    similar_users = find_similar_users(
        db,
        user_id,
        limit=20,
        min_similarity=min_similarity
    )

    if not similar_users:
        return [], Pagination(page=page, page_size=page_size, total=0)

    # Lấy những bài mà user tương tự yêu thích
    time_threshold = datetime.utcnow() - timedelta(days=days_back)
    similar_user_ids = [uid for uid, _ in similar_users]
    similarity_map = {uid: sim for uid, sim in similar_users}

    # Query bài viết được yêu thích bởi user tương tự
    liked_posts = (
        db.query(
            PostLike.post_id,
            func.count(func.distinct(PostLike.user_id)).label("like_count"),
            func.sum(
                func.case(
                    (PostLike.user_id.in_(similar_user_ids), 1),
                    else_=0
                )
            ).label("similar_user_count")
        )
        .filter(PostLike.post_id.in_(
            db.query(Post.id).filter(
                Post.status == "active",
                Post.created_at >= time_threshold
            )
        ))
        .group_by(PostLike.post_id)
        .all()
    )

    # Loại bỏ những bài user hiện tại đã like
    user_liked = {
        post_id
        for (post_id,) in db.query(PostLike.post_id)
        .filter(PostLike.user_id == user_id)
        .all()
    }

    # Loại bỏ những bài user đã view
    user_viewed = {
        post_id
        for (post_id,) in db.query(PostView.post_id)
        .filter(PostView.user_id == user_id)
        .all()
    }

    # Tính weighted score cho mỗi bài
    post_scores = []
    for post_id, like_count, similar_user_count in liked_posts:
        # Bỏ qua những bài user đã like
        if post_id in user_liked:
            continue

        # Ưu tiên những bài user chưa view
        view_penalty = 0.7 if post_id in user_viewed else 1.0

        # Tính weighted score
        # Weight = trung bình similarity của những user tương tự thích bài này
        similar_count = similar_user_count or 0
        if similar_count > 0:
            avg_similarity = similar_count / len(similar_users)
        else:
            avg_similarity = 0

        score = (like_count * avg_similarity) * view_penalty

        post_scores.append((post_id, score, similar_count))

    # Sắp xếp theo score giảm dần
    post_scores.sort(key=lambda x: x[1], reverse=True)

    # Lấy total
    total = len(post_scores)

    # Pagination
    offset = (page - 1) * page_size
    page_post_ids = [post_id for post_id, _, _ in post_scores[offset:offset + page_size]]

    if not page_post_ids:
        return [], Pagination(page=page, page_size=page_size, total=total)

    # Lấy bài viết và stats
    from sqlalchemy import case

    likes_count = func.count(func.distinct(PostLike.user_id)).label("likes_count")
    comments_count = func.count(func.distinct(Comment.id)).label("comments_count")
    views_count = func.count(func.distinct(PostView.id)).label("views_count")
    bookmarked = func.max(case((Bookmark.user_id == user_id, 1), else_=0)).label("is_bookmarked")

    posts_query = (
        select(
            Post,
            likes_count,
            comments_count,
            views_count,
            bookmarked
        )
        .outerjoin(PostLike, PostLike.post_id == Post.id)
        .outerjoin(Comment, Comment.post_id == Post.id)
        .outerjoin(PostView, PostView.post_id == Post.id)
        .outerjoin(Bookmark, Bookmark.post_id == Post.id)
        .where(Post.id.in_(page_post_ids), Post.status == "active")
        .group_by(Post.id)
    )

    posts = db.execute(posts_query).all()

    # Load relationships
    for post_data in posts:
        post = post_data[0]
        db.refresh(post, ["author", "tags"])

    # Map kết quả với score
    score_map = {post_id: score for post_id, score, _ in post_scores}

    result = []
    for post_data in posts:
        post = post_data[0]
        likes = int(post_data[1] or 0)
        comments = int(post_data[2] or 0)
        views = int(post_data[3] or 0)
        is_bookmarked = bool(post_data[4])

        # Tạo stats object
        stats = SimpleNamespace(
            likes_count=likes,
            comments_count=comments,
            views_count=views,
            shares_count=0,
            trending_score=likes * 4 + comments * 3 + views,
            is_liked=False,
            is_bookmarked=is_bookmarked
        )

        result.append({
            "post": post,
            "stats": stats,
            "cf_score": score_map.get(post.id, 0),
            "reason": "Được yêu thích bởi những người có sở thích giống bạn"
        })

    return result, Pagination(page=page, page_size=page_size, total=total)


def get_personalized_feed(
    db: Session,
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    use_collab: bool = True,
    use_content: bool = True
) -> tuple[list, Pagination]:
    """
    Lấy personalized feed kết hợp Content-Based và Collaborative Filtering.

    Chiến lược:
    - 60% từ Collaborative Filtering (những user tương tự thích gì)
    - 40% từ Content-Based (bài tương tự với những bài user yêu thích)

    Args:
        db: Database session
        user_id: ID user hiện tại
        page: Số trang
        page_size: Bài mỗi trang
        use_collab: Dùng collaborative filtering
        use_content: Dùng content-based filtering

    Returns:
        (danh sách bài viết, pagination info)
    """
    # TODO: Khi có content-based service, kết hợp 2 phương pháp
    # Hiện tại dùng collaborative filtering

    return get_collaborative_recommendations(
        db,
        user_id,
        page=page,
        page_size=page_size
    )
