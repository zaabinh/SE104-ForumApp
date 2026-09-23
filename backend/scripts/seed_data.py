import json
import random
from pathlib import Path
from datetime import datetime, timedelta

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
from services.post_service import slugify
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
    with data_path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def _parse_datetime(value) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def _interest_set(value: str | None) -> set[str]:
    return {item.strip().lower() for item in (value or "").split(",") if item.strip()}


def _post_ref(row: dict) -> str:
    return _norm(row.get("key")) or _norm(row.get("slug")) or str(row.get("id") or "")


def _major_tag_hints(major: str | None, career_goal: str | None) -> set[str]:
    text = f"{major or ''} {career_goal or ''}".lower()
    hints: set[str] = set()
    if any(term in text for term in ["software", "frontend", "full-stack", "mobile"]):
        hints.update({"frontend", "react", "nextjs", "flutter", "doan"})
    if any(term in text for term in ["computer science", "backend", "software"]):
        hints.update({"backend", "fastapi", "algorithm", "cp", "SE104"})
    if any(term in text for term in ["data", "database", "information systems"]):
        hints.update({"sqlserver", "mongodb", "backend"})
    if any(term in text for term in ["ai", "ml", "machine", "research"]):
        hints.update({"machinelearning", "yolov8", "fastapi"})
    if any(term in text for term in ["network", "devops", "cloud", "reliability"]):
        hints.update({"docker", "backend", "NT208"})
    if any(term in text for term in ["security", "soc", "penetration"]):
        hints.update({"backend", "NT208"})
    return {item.lower() for item in hints}


def _activity_weight(user: User) -> float:
    interests = _interest_set(user.interest_tags)
    score = 1.0 + min(len(interests), 5) * 0.25
    career = (user.career_goal or "").lower()
    if any(term in career for term in ["engineer", "developer", "devops", "scientist"]):
        score += 0.75
    if (user.status or "").lower() == "active":
        score += 0.5
    return score


def _affinity_score(user: User, post_tags: set[str], post_text: str) -> float:
    interests = _interest_set(user.interest_tags)
    profile_hints = _major_tag_hints(user.major, user.career_goal)
    score = _activity_weight(user)
    score += len(interests.intersection(post_tags)) * 4.0
    score += len(profile_hints.intersection(post_tags)) * 2.5

    major = (user.major or "").lower()
    career_goal = (user.career_goal or "").lower()
    if "computer science" in major and any(tag in post_tags for tag in {"algorithm", "cp", "machinelearning", "backend"}):
        score += 2.0
    if "software" in major and any(tag in post_tags for tag in {"frontend", "react", "nextjs", "backend", "doan"}):
        score += 2.0
    if "information systems" in major and any(tag in post_tags for tag in {"sqlserver", "mongodb", "backend"}):
        score += 2.0
    if "network" in major and any(tag in post_tags for tag in {"docker", "NT208", "backend"}):
        score += 2.0
    if any(term in post_text for term in career_goal.split() if len(term) >= 4):
        score += 1.5
    return max(score, 0.5)


def _weighted_sample_without_replacement(candidates: list[User], weights: list[float], limit: int) -> list[User]:
    selected: list[User] = []
    pool = list(zip(candidates, weights))
    while pool and len(selected) < limit:
        total = sum(weight for _, weight in pool)
        if total <= 0:
            choice_index = random.randrange(len(pool))
        else:
            pick = random.uniform(0, total)
            cursor = 0.0
            choice_index = 0
            for idx, (_, weight) in enumerate(pool):
                cursor += weight
                if cursor >= pick:
                    choice_index = idx
                    break
        user, _ = pool.pop(choice_index)
        selected.append(user)
    return selected


def _interaction_time(post_created_at: datetime, min_minutes: int, max_minutes: int) -> datetime:
    return post_created_at + timedelta(minutes=random.randint(min_minutes, max_minutes))


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
            slug = slugify(name)
        else:
            name = _lower(row.get("name"))
            slug = _lower(row.get("slug")) or slugify(name)
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
        slug = _lower(row.get("slug")) or slugify(title)
        if not title or not slug:
            continue

        existing_slug = slug
        suffix = 2
        while True:
            post = db.query(Post).filter(Post.slug == existing_slug).first()
            if not post or post.title == title:
                slug = existing_slug
                break
            existing_slug = f"{slug}-{suffix}"
            suffix += 1

        post = db.query(Post).filter(Post.slug == slug).first()
        if not post:
            created_at = _parse_datetime(row.get("created_at"))
            post = Post(
                user_id=author.id,
                title=title,
                slug=slug,
                content=_norm(row.get("content")),
                cover_image=row.get("cover_image"),
                status=_lower(row.get("status")) or "active",
                share_caption=row.get("share_caption"),
            )
            if created_at:
                post.created_at = created_at
            # Optional original post link for share posts
            original_ref = _norm(row.get("original_post_key")) or _norm(row.get("original_post_slug"))
            if original_ref:
                original = by_key.get(original_ref) or db.query(Post).filter(Post.slug == original_ref).first()
                if original:
                    post.original_post_id = original.id
            db.add(post)
            db.flush()

        for raw_tag in row.get("tags", []) or []:
            slug_tag = slugify(_lower(raw_tag))
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


def _seed_natural_interactions(db: Session, posts_data: list[dict], users: dict[str, User], posts: dict[str, Post]) -> None:
    unique_users = list({user.id: user for user in users.values()}.values())
    seeded_posts = [posts[_post_ref(row)] for row in posts_data if _post_ref(row) in posts]
    seeded_post_ids = [post.id for post in seeded_posts]
    if not seeded_post_ids or not unique_users:
        return

    db.query(PostShare).filter(PostShare.post_id.in_(seeded_post_ids)).delete(synchronize_session=False)
    db.query(PostLike).filter(PostLike.post_id.in_(seeded_post_ids)).delete(synchronize_session=False)
    db.query(PostView).filter(PostView.post_id.in_(seeded_post_ids)).delete(synchronize_session=False)
    db.flush()

    for row in posts_data:
        post = posts.get(_post_ref(row))
        if not post:
            continue

        target_views = int(row.get("views_count") or random.randint(10, 20))
        target_views = max(10, min(20, target_views))
        post_tags = {_lower(tag) for tag in row.get("tags", []) or []}
        post_text = f"{row.get('title') or ''} {row.get('content') or ''}".lower()
        post_created_at = post.created_at or _parse_datetime(row.get("created_at")) or datetime.now()

        candidates = [user for user in unique_users if user.id != post.user_id]
        weights = [_affinity_score(user, post_tags, post_text) for user in candidates]
        viewer_limit = min(target_views, len(candidates))
        viewers = _weighted_sample_without_replacement(candidates, weights, viewer_limit)
        view_times: dict[str, datetime] = {}

        for user in viewers:
            viewed_at = _interaction_time(post_created_at, 15, 60 * 72)
            view_times[user.id] = viewed_at
            db.add(PostView(post_id=post.id, user_id=user.id, created_at=viewed_at))

        for _ in range(max(0, target_views - len(viewers))):
            db.add(PostView(post_id=post.id, user_id=None, created_at=_interaction_time(post_created_at, 20, 60 * 96)))

        if not viewers:
            continue

        like_count = max(1, round(len(viewers) * random.uniform(0.2, 0.5)))
        like_count = min(like_count, len(viewers))
        like_weights = [_affinity_score(user, post_tags, post_text) for user in viewers]
        liked_users = _weighted_sample_without_replacement(viewers, like_weights, like_count)

        for user in liked_users:
            liked_at = view_times[user.id] + timedelta(minutes=random.randint(5, 60 * 48))
            db.add(PostLike(user_id=user.id, post_id=post.id, created_at=liked_at))

        share_pool = list({user.id: user for user in [*liked_users, *viewers]}.values())
        share_count = round(len(viewers) * random.uniform(0.05, 0.2))
        share_count = min(max(0, share_count), len(share_pool))
        if share_count:
            share_weights = [_affinity_score(user, post_tags, post_text) + (2.0 if user in liked_users else 0.0) for user in share_pool]
            shared_users = _weighted_sample_without_replacement(share_pool, share_weights, share_count)
            for user in shared_users:
                base_time = view_times.get(user.id, post_created_at)
                shared_at = base_time + timedelta(minutes=random.randint(15, 60 * 72))
                db.add(PostShare(user_id=user.id, post_id=post.id, created_at=shared_at))


def _seed_relations(db: Session, data: dict, users: dict[str, User], posts: dict[str, Post]) -> None:
    def resolve_user(ref):
        return users.get(_lower(ref))

    def resolve_post(ref):
        return posts.get(_norm(str(ref)))

    for row in data.get("bookmarks", []) or []:
        user = resolve_user(row.get("user"))
        post = resolve_post(row.get("post_key") or row.get("post"))
        if not user or not post:
            continue
        exists = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.post_id == post.id).first()
        if not exists:
            db.add(Bookmark(user_id=user.id, post_id=post.id))


def create_data() -> None:
    data = _read_data_file()
    db: Session = SessionLocal()
    try:
        users = _seed_users(db, data.get("users", []) or [])
        tags = _seed_tags(db, data.get("tags", []) or [])
        posts = _seed_posts(db, data.get("posts", []) or [], users, tags)
        _seed_comments(db, data.get("comments", []) or [], users, posts)
        _seed_natural_interactions(db, data.get("posts", []) or [], users, posts)
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
