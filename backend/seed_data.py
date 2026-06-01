import json
from pathlib import Path

from sqlalchemy.orm import Session

from database import SessionLocal
from models.bookmark import Bookmark
from models.comment import Comment
from models.post import Post
from models.post_like import PostLike
from models.post_share import PostShare
from models.post_tag import PostTag
from models.post_view import PostView
from models.tag import Tag
from models.user import User
from utils.hash import hash_password


def _norm(value: str | None) -> str:
    return (value or "").strip()


def _lower(value: str | None) -> str:
    return _norm(value).lower()


def _to_interest_tags(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        parts = [item.strip().lower() for item in value.split(",") if item.strip()]
        return ",".join(dict.fromkeys(parts)) or None
    if isinstance(value, list):
        parts = [str(item).strip().lower() for item in value if str(item).strip()]
        return ",".join(dict.fromkeys(parts)) or None
    return None


def _read_data_file() -> dict:
    data_path = Path(__file__).resolve().parent / "data.json"
    if not data_path.exists():
        raise FileNotFoundError(f"data.json not found: {data_path}")
    with data_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _seed_users(db: Session, users_data: list[dict]) -> dict[str, User]:
    by_key: dict[str, User] = {}
    for row in users_data:
        username = _lower(row.get("username"))
        email = _lower(row.get("email"))
        if not email:
            continue

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raw_password = _norm(row.get("password")) or "12345678"
            user = User(
                username=username or None,
                email=email,
                password_hash=hash_password(raw_password),
                full_name=_norm(row.get("full_name")) or username or email.split("@", 1)[0],
                avatar_url=row.get("avatar_url"),
                bio=row.get("bio"),
                major=row.get("major"),
                academic_year=row.get("academic_year"),
                career_goal=row.get("career_goal"),
                interest_tags=_to_interest_tags(row.get("interest_tags")),
                role=_lower(row.get("role")) or "student",
                status=_lower(row.get("status")) or "active",
                provider=_lower(row.get("provider")) or "local",
                is_verified=bool(row.get("is_verified", True)),
            )
            db.add(user)
            db.flush()

        if username:
            by_key[username] = user
        by_key[email] = user
    return by_key


def _seed_tags(db: Session, tags_data: list) -> dict[str, Tag]:
    by_slug: dict[str, Tag] = {}
    for row in tags_data:
        if isinstance(row, str):
            name = _lower(row)
            slug = name.replace(" ", "-")
        else:
            name = _lower(row.get("name"))
            slug = _lower(row.get("slug")) or name.replace(" ", "-")
        if not name or not slug:
            continue
        tag = db.query(Tag).filter(Tag.slug == slug).first()
        if not tag:
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            db.flush()
        by_slug[slug] = tag
    return by_slug


def _seed_posts(db: Session, posts_data: list[dict], users: dict[str, User], tags: dict[str, Tag]) -> dict[str, Post]:
    by_key: dict[str, Post] = {}
    for row in posts_data:
        post_key = _norm(row.get("key")) or _norm(row.get("slug")) or str(row.get("id") or "")
        author_ref = _lower(row.get("author")) or _lower(row.get("username")) or _lower(row.get("email"))
        author = users.get(author_ref)
        if not author:
            continue

        title = _norm(row.get("title"))
        slug = _lower(row.get("slug")) or title.lower().replace(" ", "-")
        if not title or not slug:
            continue

        post = db.query(Post).filter(Post.slug == slug).first()
        if not post:
            post = Post(
                user_id=author.id,
                title=title,
                slug=slug,
                content=_norm(row.get("content")),
                cover_image=row.get("cover_image"),
                status=_lower(row.get("status")) or "active",
                share_caption=row.get("share_caption"),
            )
            # Optional original post link for share posts
            original_ref = _norm(row.get("original_post_key")) or _norm(row.get("original_post_slug"))
            if original_ref:
                original = by_key.get(original_ref) or db.query(Post).filter(Post.slug == original_ref).first()
                if original:
                    post.original_post_id = original.id
            db.add(post)
            db.flush()

        for raw_tag in row.get("tags", []) or []:
            slug_tag = _lower(raw_tag).replace(" ", "-")
            tag = tags.get(slug_tag)
            if not tag:
                continue
            exists = db.query(PostTag).filter(PostTag.post_id == post.id, PostTag.tag_id == tag.id).first()
            if not exists:
                db.add(PostTag(post_id=post.id, tag_id=tag.id))

        if post_key:
            by_key[post_key] = post
        by_key[slug] = post
        by_key[str(post.id)] = post
    return by_key


def _seed_comments(db: Session, comments_data: list[dict], users: dict[str, User], posts: dict[str, Post]) -> None:
    for row in comments_data:
        author_ref = _lower(row.get("author")) or _lower(row.get("username")) or _lower(row.get("email"))
        post_ref = _norm(row.get("post_key")) or _norm(row.get("post_slug")) or str(row.get("post_id") or "")
        author = users.get(author_ref)
        post = posts.get(post_ref)
        content = _norm(row.get("content"))
        if not author or not post or not content:
            continue
        exists = (
            db.query(Comment)
            .filter(Comment.post_id == post.id, Comment.user_id == author.id, Comment.content == content)
            .first()
        )
        if not exists:
            db.add(Comment(post_id=post.id, user_id=author.id, content=content, parent_id=None))


def _seed_relations(db: Session, data: dict, users: dict[str, User], posts: dict[str, Post]) -> None:
    def resolve_user(ref):
        return users.get(_lower(ref))

    def resolve_post(ref):
        return posts.get(_norm(str(ref)))

    for row in data.get("likes", []) or []:
        user = resolve_user(row.get("user"))
        post = resolve_post(row.get("post"))
        if not user or not post:
            continue
        exists = db.query(PostLike).filter(PostLike.user_id == user.id, PostLike.post_id == post.id).first()
        if not exists:
            db.add(PostLike(user_id=user.id, post_id=post.id))

    for row in data.get("bookmarks", []) or []:
        user = resolve_user(row.get("user"))
        post = resolve_post(row.get("post"))
        if not user or not post:
            continue
        exists = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.post_id == post.id).first()
        if not exists:
            db.add(Bookmark(user_id=user.id, post_id=post.id))

    for row in data.get("views", []) or []:
        user = resolve_user(row.get("user"))
        post = resolve_post(row.get("post"))
        if not user or not post:
            continue
        exists = db.query(PostView).filter(PostView.user_id == user.id, PostView.post_id == post.id).first()
        if not exists:
            db.add(PostView(user_id=user.id, post_id=post.id))

    for row in data.get("shares", []) or []:
        user = resolve_user(row.get("user"))
        post = resolve_post(row.get("post"))
        if not user or not post:
            continue
        exists = db.query(PostShare).filter(PostShare.user_id == user.id, PostShare.post_id == post.id).first()
        if not exists:
            db.add(PostShare(user_id=user.id, post_id=post.id))


def create_data() -> None:
    data = _read_data_file()
    db: Session = SessionLocal()
    try:
        users = _seed_users(db, data.get("users", []) or [])
        tags = _seed_tags(db, data.get("tags", []) or [])
        posts = _seed_posts(db, data.get("posts", []) or [], users, tags)
        _seed_comments(db, data.get("comments", []) or [], users, posts)
        _seed_relations(db, data, users, posts)
        db.commit()
        print("Seeded data from data.json successfully.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_data()
