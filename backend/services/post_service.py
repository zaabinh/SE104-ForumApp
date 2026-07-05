import math
import re
import json
import unicodedata
from dataclasses import dataclass
from types import SimpleNamespace
from datetime import datetime

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, joinedload

from models.bookmark import Bookmark
from models.comment import Comment
from models.follow import Follow
from models.post import Post
from models.post_like import PostLike
from models.post_share import PostShare
from models.post_tag import PostTag
from models.post_view import PostView
from models.tag import Tag
from models.user import User


def slugify(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value.strip().lower()).encode("ascii", "ignore").decode("ascii")
    normalized = re.sub(r"[^a-zA-Z0-9\s-]", "", ascii_value)
    normalized = re.sub(r"\s+", "-", normalized)
    return normalized.strip("-") or "post"


def normalize_tags(raw_tags: list[str] | None) -> list[str]:
    if not raw_tags:
        return []
    seen: set[str] = set()
    normalized: list[str] = []
    for raw_tag in raw_tags:
        name = raw_tag.strip().lower()
        if not name or name in seen:
            continue
        seen.add(name)
        normalized.append(name)
    return normalized


def split_known_and_new_tags(db: Session, raw_tags: list[str] | None) -> tuple[list[str], list[str]]:
    desired_names = normalize_tags(raw_tags)
    if not desired_names:
        return [], []
    existing_tags = db.query(Tag).filter(Tag.name.in_(desired_names)).all()
    existing_names = {tag.name for tag in existing_tags}
    known = [name for name in desired_names if name in existing_names]
    new_tags = [name for name in desired_names if name not in existing_names]
    return known, new_tags


def sync_post_tags(db: Session, post: Post, raw_tags: list[str] | None, create_missing: bool = True) -> None:
    desired_names = normalize_tags(raw_tags)
    current_names = {association.tag.name: association for association in post.tags}

    for name, association in list(current_names.items()):
        if name not in desired_names:
            db.delete(association)

    for name in desired_names:
        if name in current_names:
            continue
        slug = slugify(name)
        tag = db.query(Tag).filter(Tag.slug == slug).first()
        if not tag:
            if not create_missing:
                continue
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            db.flush()
        db.add(PostTag(post_id=post.id, tag_id=tag.id))


@dataclass
class Pagination:
    page: int
    page_size: int
    total: int

    @property
    def total_pages(self) -> int:
        return max(1, math.ceil(self.total / self.page_size)) if self.page_size else 1
    
hours_old = 12
def build_post_query(current_user_id: str | None, search: str | None, tag: str | None, mode: str, sort: str):
    likes_count = func.count(func.distinct(PostLike.user_id)).label("likes_count")
    comments_count = func.count(func.distinct(Comment.id)).label("comments_count")
    views_count = func.count(func.distinct(PostView.id)).label("views_count")
    shares_count = func.count(func.distinct(PostShare.id)).label("shares_count")
    
    time_decay = math.exp(-hours_old / 24)
    trending_score = ((likes_count * 4 + comments_count * 3 + views_count)*time_decay).label("trending_score")
    is_liked = func.max(case((PostLike.user_id == current_user_id, 1), else_=0)).label("is_liked")
    is_bookmarked = func.max(case((Bookmark.user_id == current_user_id, 1), else_=0)).label("is_bookmarked")

    query = (
        select(
            Post,
            likes_count,
            comments_count,
            views_count,
            shares_count,
            trending_score,
            is_liked,
            is_bookmarked,
        )
        .outerjoin(PostLike, PostLike.post_id == Post.id)
        .outerjoin(Comment, (Comment.post_id == Post.id) & (Comment.status == "active"))
        .outerjoin(PostView, PostView.post_id == Post.id)
        .outerjoin(PostShare, PostShare.post_id == Post.id)
        .outerjoin(Bookmark, Bookmark.post_id == Post.id)
        .where(Post.status == "active")
        .group_by(
            Post.id,
            Post.user_id,
            Post.title,
            Post.slug,
            Post.content,
            Post.cover_image,
            Post.status,
            Post.original_post_id,
            Post.share_caption,
            Post.requested_new_tags,
            Post.created_at,
        )
    )

    if search:
        term = f"%{search.strip()}%"
        query = query.where((Post.title.ilike(term)) | (Post.content.ilike(term)))

    if tag:
        query = query.join(PostTag, PostTag.post_id == Post.id).join(Tag, Tag.id == PostTag.tag_id).where(Tag.slug == slugify(tag))

    if mode == "following" and current_user_id:
        query = query.join(Follow, Follow.following_id == Post.user_id).where(Follow.follower_id == current_user_id)

    if sort == "trending" or mode == "trending":
        query = query.order_by(trending_score.desc(), Post.created_at.desc(), Post.id.desc())
    elif sort == "most-liked":
        query = query.order_by(likes_count.desc(), Post.created_at.desc(), Post.id.desc())
    elif sort == "most-commented":
        query = query.order_by(comments_count.desc(), Post.created_at.desc(), Post.id.desc())
    else:
        query = query.order_by(Post.created_at.desc(), Post.id.desc())

    return query


def paginate_query(db: Session, query, page: int, page_size: int):
    page = max(1, page)
    page_size = min(max(1, page_size), 50)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    rows = db.execute(query.offset((page - 1) * page_size).limit(page_size)).all()
    return rows, Pagination(page=page, page_size=page_size, total=total)


def _paginate_bounds(page: int, page_size: int) -> tuple[int, int]:
    normalized_page = max(1, page)
    normalized_page_size = min(max(1, page_size), 50)
    return normalized_page, normalized_page_size


def _parse_interest_tags(raw_tags: str | None) -> set[str]:
    if not raw_tags:
        return set()
    return {item.strip().lower() for item in raw_tags.split(",") if item.strip()}


def paginate_latest_posts_fast(
    db: Session,
    current_user_id: str | None,
    search: str | None,
    tag: str | None,
    mode: str,
    page: int,
    page_size: int,
):
    page, page_size = _paginate_bounds(page, page_size)
    offset = (page - 1) * page_size

    post_ids_query = select(Post.id).where(Post.status == "active")

    if search:
        term = f"%{search.strip()}%"
        post_ids_query = post_ids_query.where((Post.title.ilike(term)) | (Post.content.ilike(term)))

    if tag:
        post_ids_query = (
            post_ids_query.join(PostTag, PostTag.post_id == Post.id)
            .join(Tag, Tag.id == PostTag.tag_id)
            .where(Tag.slug == slugify(tag))
        )

    if mode == "following" and current_user_id:
        post_ids_query = post_ids_query.join(Follow, Follow.following_id == Post.user_id).where(Follow.follower_id == current_user_id)

    total = db.execute(select(func.count()).select_from(post_ids_query.distinct().subquery())).scalar_one()
    if mode == "for-you" and current_user_id:
        candidate_ids = db.execute(post_ids_query.order_by(Post.created_at.desc(), Post.id.desc()).limit(200)).scalars().all()
        if candidate_ids:
            user = db.query(User).filter(User.id == current_user_id).first()
            preferred_tags = _parse_interest_tags(user.interest_tags if user else None)
            following_ids = {
                followed_id
                for (followed_id,) in db.query(Follow.following_id).filter(Follow.follower_id == current_user_id).all()
            }
            candidate_posts = (
                db.query(Post)
                .options(joinedload(Post.tags).joinedload(PostTag.tag))
                .filter(Post.id.in_(candidate_ids))
                .all()
            )
            post_by_id = {post.id: post for post in candidate_posts}

            likes_map = dict(db.query(PostLike.post_id, func.count()).filter(PostLike.post_id.in_(candidate_ids)).group_by(PostLike.post_id).all())
            comments_map = dict(db.query(Comment.post_id, func.count()).filter(Comment.post_id.in_(candidate_ids), Comment.status == "active").group_by(Comment.post_id).all())
            views_map = dict(db.query(PostView.post_id, func.count()).filter(PostView.post_id.in_(candidate_ids)).group_by(PostView.post_id).all())
            shares_map = dict(db.query(PostShare.post_id, func.count()).filter(PostShare.post_id.in_(candidate_ids)).group_by(PostShare.post_id).all())

            def score(post_id: int) -> float:
                post = post_by_id.get(post_id)
                if not post:
                    return 0.0
                post_tags = {assoc.tag.name.lower() for assoc in post.tags if assoc.tag and assoc.tag.name}
                tag_overlap = len(preferred_tags.intersection(post_tags))
                follow_score = 3 if post.user_id in following_ids else 0
                popularity = float(likes_map.get(post_id, 0)) * 2.0 + float(comments_map.get(post_id, 0)) * 2.5 + float(shares_map.get(post_id, 0)) * 1.5 + float(views_map.get(post_id, 0)) * 0.2
                return tag_overlap * 4.0 + follow_score + popularity

            ranked_ids = sorted(candidate_ids, key=lambda post_id: (score(post_id), post_id), reverse=True)
            page_ids = ranked_ids[offset: offset + page_size]
        else:
            page_ids = []
    else:
        page_ids = db.execute(post_ids_query.order_by(Post.created_at.desc(), Post.id.desc()).offset(offset).limit(page_size)).scalars().all()

    if not page_ids:
        return [], Pagination(page=page, page_size=page_size, total=total)

    posts = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(Post.id.in_(page_ids))
        .all()
    )
    post_by_id = {post.id: post for post in posts}
    ordered_posts = [post_by_id[post_id] for post_id in page_ids if post_id in post_by_id]

    likes_map = dict(db.query(PostLike.post_id, func.count()).filter(PostLike.post_id.in_(page_ids)).group_by(PostLike.post_id).all())
    comments_map = dict(db.query(Comment.post_id, func.count()).filter(Comment.post_id.in_(page_ids), Comment.status == "active").group_by(Comment.post_id).all())
    views_map = dict(db.query(PostView.post_id, func.count()).filter(PostView.post_id.in_(page_ids)).group_by(PostView.post_id).all())
    shares_map = dict(db.query(PostShare.post_id, func.count()).filter(PostShare.post_id.in_(page_ids)).group_by(PostShare.post_id).all())

    liked_set: set[int] = set()
    bookmarked_set: set[int] = set()
    if current_user_id:
        liked_set = set(
            db.query(PostLike.post_id)
            .filter(PostLike.user_id == current_user_id, PostLike.post_id.in_(page_ids))
            .all()
        )
        liked_set = {post_id for (post_id,) in liked_set}

        bookmarked_set = set(
            db.query(Bookmark.post_id)
            .filter(Bookmark.user_id == current_user_id, Bookmark.post_id.in_(page_ids))
            .all()
        )
        bookmarked_set = {post_id for (post_id,) in bookmarked_set}

    rows = []
    for post in ordered_posts:
        likes_count = int(likes_map.get(post.id, 0))
        comments_count = int(comments_map.get(post.id, 0))
        views_count = int(views_map.get(post.id, 0))
        shares_count = int(shares_map.get(post.id, 0))
        stats = SimpleNamespace(
            likes_count=likes_count,
            comments_count=comments_count,
            views_count=views_count,
            shares_count=shares_count,
            trending_score=likes_count * 4 + comments_count * 3 + views_count,
            is_liked=post.id in liked_set,
            is_bookmarked=post.id in bookmarked_set,
        )
        rows.append((post, stats))

    return rows, Pagination(page=page, page_size=page_size, total=total)


def paginate_trending_posts_fast(
    db: Session,
    current_user_id: str | None,
    search: str | None,
    tag: str | None,
    page: int,
    page_size: int,
):
    page, page_size = _paginate_bounds(page, page_size)
    offset = (page - 1) * page_size

    post_ids_query = select(Post.id).where(Post.status == "active")

    if search:
        term = f"%{search.strip()}%"
        post_ids_query = post_ids_query.where((Post.title.ilike(term)) | (Post.content.ilike(term)))

    if tag:
        post_ids_query = (
            post_ids_query.join(PostTag, PostTag.post_id == Post.id)
            .join(Tag, Tag.id == PostTag.tag_id)
            .where(Tag.slug == slugify(tag))
        )

    total = db.execute(select(func.count()).select_from(post_ids_query.distinct().subquery())).scalar_one()
    candidate_ids = db.execute(post_ids_query.order_by(Post.created_at.desc(), Post.id.desc()).limit(300)).scalars().all()
    if not candidate_ids:
        return [], Pagination(page=page, page_size=page_size, total=total)

    likes_map = dict(db.query(PostLike.post_id, func.count()).filter(PostLike.post_id.in_(candidate_ids)).group_by(PostLike.post_id).all())
    comments_map = dict(db.query(Comment.post_id, func.count()).filter(Comment.post_id.in_(candidate_ids), Comment.status == "active").group_by(Comment.post_id).all())
    views_map = dict(db.query(PostView.post_id, func.count()).filter(PostView.post_id.in_(candidate_ids)).group_by(PostView.post_id).all())
    shares_map = dict(db.query(PostShare.post_id, func.count()).filter(PostShare.post_id.in_(candidate_ids)).group_by(PostShare.post_id).all())

    posts = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags).joinedload(PostTag.tag))
        .filter(Post.id.in_(candidate_ids))
        .all()
    )
    post_by_id = {post.id: post for post in posts}

    def score(post_id: int) -> float:
        post = post_by_id.get(post_id)
        if not post:
            return 0.0
        age_hours = max((datetime.now() - post.created_at).total_seconds() / 3600, 0.0)
        decay = math.exp(-age_hours / 72)
        popularity = (
            float(likes_map.get(post_id, 0)) * 4.0
            + float(comments_map.get(post_id, 0)) * 3.0
            + float(shares_map.get(post_id, 0)) * 5.0
            + float(views_map.get(post_id, 0))
        )
        return popularity * decay

    ranked_ids = sorted(candidate_ids, key=lambda post_id: (score(post_id), post_id), reverse=True)
    page_ids = ranked_ids[offset: offset + page_size]
    ordered_posts = [post_by_id[post_id] for post_id in page_ids if post_id in post_by_id]

    liked_set: set[int] = set()
    bookmarked_set: set[int] = set()
    if current_user_id and page_ids:
        liked_set = {
            post_id
            for (post_id,) in db.query(PostLike.post_id)
            .filter(PostLike.user_id == current_user_id, PostLike.post_id.in_(page_ids))
            .all()
        }
        bookmarked_set = {
            post_id
            for (post_id,) in db.query(Bookmark.post_id)
            .filter(Bookmark.user_id == current_user_id, Bookmark.post_id.in_(page_ids))
            .all()
        }

    rows = []
    for post in ordered_posts:
        likes_count = int(likes_map.get(post.id, 0))
        comments_count = int(comments_map.get(post.id, 0))
        views_count = int(views_map.get(post.id, 0))
        shares_count = int(shares_map.get(post.id, 0))
        stats = SimpleNamespace(
            likes_count=likes_count,
            comments_count=comments_count,
            views_count=views_count,
            shares_count=shares_count,
            trending_score=int(score(post.id)),
            is_liked=post.id in liked_set,
            is_bookmarked=post.id in bookmarked_set,
        )
        rows.append((post, stats))

    return rows, Pagination(page=page, page_size=page_size, total=total)


def serialize_post(post: Post, stats_row, current_user_id: str | None) -> dict:
    cover_image = post.cover_image
    if isinstance(cover_image, str):
        normalized_cover = cover_image.strip().lower()
        if not normalized_cover or normalized_cover.endswith("/images/uit.png"):
            cover_image = None

    requested_new_tags: list[str] = []
    if post.requested_new_tags:
        try:
            parsed = json.loads(post.requested_new_tags)
            if isinstance(parsed, list):
                requested_new_tags = [str(item) for item in parsed if str(item).strip()]
        except Exception:
            requested_new_tags = []

    return {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "cover_image": cover_image,
        "status": post.status,
        "original_post_id": post.original_post_id,
        "share_caption": post.share_caption,
        "requested_new_tags": requested_new_tags,
        "tags": [association.tag.name for association in post.tags],
        "created_at": post.created_at,
        "author": post.author,
        "likes_count": int(stats_row.likes_count or 0),
        "comments_count": int(stats_row.comments_count or 0),
        "views_count": int(stats_row.views_count or 0),
        "shares_count": int(stats_row.shares_count or 0),
        "trending_score": int(stats_row.trending_score or 0),
        "is_liked": bool(stats_row.is_liked) if current_user_id else False,
        "is_bookmarked": bool(stats_row.is_bookmarked) if current_user_id else False,
    }
