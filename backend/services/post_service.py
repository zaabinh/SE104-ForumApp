import math
import re
from dataclasses import dataclass

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from models.bookmark import Bookmark
from models.comment import Comment
from models.follow import Follow
from models.post import Post
from models.post_like import PostLike
from models.post_share import PostShare
from models.post_tag import PostTag
from models.post_view import PostView
from models.tag import Tag


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9\\s-]", "", value.strip().lower())
    normalized = re.sub(r"\\s+", "-", normalized)
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


def sync_post_tags(db: Session, post: Post, raw_tags: list[str] | None) -> None:
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


def build_post_query(current_user_id: str | None, search: str | None, tag: str | None, mode: str, sort: str):
    likes_count = func.count(func.distinct(PostLike.user_id)).label("likes_count")
    comments_count = func.count(func.distinct(Comment.id)).label("comments_count")
    views_count = func.count(func.distinct(PostView.id)).label("views_count")
    shares_count = func.count(func.distinct(PostShare.id)).label("shares_count")
    trending_score = (likes_count * 4 + comments_count * 3 + views_count).label("trending_score")
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
        .outerjoin(Comment, Comment.post_id == Post.id)
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


def serialize_post(post: Post, stats_row, current_user_id: str | None) -> dict:
    return {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "cover_image": post.cover_image,
        "status": post.status,
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
