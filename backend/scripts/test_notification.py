import os
import sys
import types
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
sys.path.insert(0, str(Path(__file__).resolve().parent))

auth_stub = types.ModuleType("dependencies.auth")
auth_stub.require_active_verified_user = lambda *args, **kwargs: None
auth_stub.require_role = lambda *args, **kwargs: None
sys.modules.setdefault("dependencies.auth", auth_stub)

from models.comment import Comment
from models.follow import Follow
from models.notification import Notification
from models.post import Post
from models.post_like import PostLike
from models.report import Report
from models.user import User
from routers import admin as admin_router
from routers import comment as comment_router
from routers import post as post_router
from routers import user as user_router
from schemas.comment_schema import CommentCreate
from schemas.report_schema import ReportCreate, ReportModerate
from services.notification_service import create_notification, notify_admins, notify_followers


def utc_now_naive():
    return datetime.now(UTC).replace(tzinfo=None)


class FakeQuery:
    def __init__(self, rows):
        self.rows = rows

    def filter(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def offset(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def join(self, *args, **kwargs):
        return self

    def outerjoin(self, *args, **kwargs):
        return self

    def first(self):
        return self.rows[0] if self.rows else None

    def all(self):
        return list(self.rows)

    def count(self):
        return len(self.rows)

    def scalar(self):
        return len(self.rows)


class FakeSession:
    def __init__(self, rows_by_model=None):
        self.rows_by_model = rows_by_model or {}
        self.added = []
        self.deleted = []
        self.commits = 0
        self.flushes = 0

    def query(self, model, *args):
        return FakeQuery(self.rows_by_model.get(model, []))

    def add(self, obj):
        if hasattr(obj, "id") and getattr(obj, "id", None) is None:
            obj.id = len(self.added) + 1
        self.added.append(obj)
        self.rows_by_model.setdefault(type(obj), []).append(obj)

    def delete(self, obj):
        self.deleted.append(obj)

    def flush(self):
        self.flushes += 1

    def commit(self):
        self.commits += 1

    def refresh(self, obj):
        if hasattr(obj, "created_at") and getattr(obj, "created_at", None) is None:
            obj.created_at = utc_now_naive()


def make_user(user_id, username, role="Student", status="active"):
    return User(
        id=user_id,
        username=username,
        email=f"{username}@example.com",
        password_hash="hash",
        full_name=username.title(),
        role=role,
        status=status,
        is_verified=True,
    )


def make_post(post_id=10, user_id="author-id", title="Notification post", status="active"):
    post = Post(id=post_id, user_id=user_id, title=title, content="Body", status=status)
    post.tags = []
    post.author = make_user(user_id, "author")
    return post


def make_comment(comment_id=20, post_id=10, user_id="commenter-id"):
    return Comment(
        id=comment_id,
        post_id=post_id,
        user_id=user_id,
        content="Comment",
        status="active",
        created_at=utc_now_naive(),
    )


def collect_notifications(monkeypatch, module):
    calls = []

    def fake_create_notification(db, **kwargs):
        calls.append(kwargs)
        return SimpleNamespace(**kwargs)

    monkeypatch.setattr(module, "create_notification", fake_create_notification)
    return calls


def test_create_notification_builds_unread_notification():
    db = FakeSession()

    notification = create_notification(
        db,
        user_id="target-id",
        actor_id="actor-id",
        notification_type="post_like",
        title="Your post was liked",
        message="actor liked your post.",
        post_id=10,
        comment_id=20,
        report_id=30,
    )

    assert notification in db.added
    assert notification.user_id == "target-id"
    assert notification.actor_id == "actor-id"
    assert notification.type == "post_like"
    assert notification.title == "Your post was liked"
    assert notification.message == "actor liked your post."
    assert notification.is_read is None or notification.is_read is False
    assert notification.post_id == 10
    assert notification.comment_id == 20
    assert notification.report_id == 30


def test_notify_admins_targets_active_admins_except_actor():
    actor_admin = make_user("admin-1", "actoradmin", role="admin")
    target_admin = make_user("admin-2", "targetadmin", role="admin")
    db = FakeSession({User: [actor_admin, target_admin]})

    notifications = notify_admins(
        db,
        actor_id=actor_admin.id,
        notification_type="post_report",
        title="New post report",
        message="A post was reported.",
        post_id=10,
        report_id=99,
    )

    assert len(notifications) == 1
    assert notifications[0].user_id == target_admin.id
    assert notifications[0].actor_id == actor_admin.id
    assert notifications[0].type == "post_report"
    assert notifications[0].post_id == 10
    assert notifications[0].report_id == 99


def test_notify_followers_targets_author_followers():
    follow = Follow(follower_id="follower-id", following_id="author-id")
    db = FakeSession({Follow: [follow]})

    notifications = notify_followers(
        db,
        author_id="author-id",
        notification_type="new_post",
        title="New post from someone you follow",
        message="author published a new post.",
        post_id=10,
    )

    assert len(notifications) == 1
    assert notifications[0].user_id == "follower-id"
    assert notifications[0].actor_id == "author-id"
    assert notifications[0].type == "new_post"
    assert notifications[0].post_id == 10


def test_post_approval_notifies_post_author(monkeypatch):
    admin = make_user("admin-id", "admin", role="admin")
    post = make_post(user_id="author-id", status="pending")
    db = FakeSession({Post: [post]})
    calls = collect_notifications(monkeypatch, admin_router)

    response = admin_router.approve_post(post.id, current_user=admin, db=db)

    assert response.message == "Post approved successfully."
    assert post.status == "active"
    assert calls == [
        {
            "user_id": "author-id",
            "actor_id": "admin-id",
            "notification_type": "post_approved",
            "title": "Your post was approved",
            "message": 'Your post "Notification post" is now visible in the feed.',
            "post_id": post.id,
        }
    ]


def test_like_notifies_post_author(monkeypatch):
    actor = make_user("liker-id", "liker")
    post = make_post(user_id="author-id")
    db = FakeSession({Post: [post], PostLike: []})
    calls = collect_notifications(monkeypatch, post_router)

    response = post_router.toggle_like(post.id, current_user=actor, db=db)

    assert response.message == "Post liked successfully."
    assert calls[0]["user_id"] == "author-id"
    assert calls[0]["actor_id"] == "liker-id"
    assert calls[0]["notification_type"] == "post_like"
    assert calls[0]["post_id"] == post.id


def test_comment_and_reply_create_expected_notifications(monkeypatch):
    actor = make_user("reply-user-id", "replyuser")
    post = make_post(user_id="author-id")
    parent_comment = make_comment(user_id="comment-author-id")
    db = FakeSession({Post: [post], Comment: [parent_comment]})
    calls = collect_notifications(monkeypatch, comment_router)

    comment_router.create_comment(
        post.id,
        CommentCreate(content="Reply body", parent_id=parent_comment.id),
        current_user=actor,
        db=db,
    )

    assert [call["notification_type"] for call in calls] == ["comment", "reply"]
    assert calls[0]["user_id"] == "author-id"
    assert calls[0]["post_id"] == post.id
    assert calls[1]["user_id"] == "comment-author-id"
    assert calls[1]["comment_id"] == parent_comment.id


def test_admin_delete_post_notifies_author(monkeypatch):
    admin = make_user("admin-id", "admin", role="admin")
    post = make_post(user_id="author-id")
    db = FakeSession({Post: [post], Comment: []})
    calls = collect_notifications(monkeypatch, post_router)

    response = post_router.delete_post(post.id, current_user=admin, db=db)

    assert response.message == "Post deleted successfully."
    assert post.status == "deleted"
    assert calls[0]["notification_type"] == "post_moderation"
    assert calls[0]["title"] == "Your post was removed"
    assert calls[0]["user_id"] == "author-id"


def test_post_report_notifies_admins_and_post_author(monkeypatch):
    reporter = make_user("reporter-id", "reporter")
    post = make_post(user_id="author-id")
    db = FakeSession({Post: [post], Report: []})
    admin_calls = []
    owner_calls = collect_notifications(monkeypatch, post_router)

    def fake_notify_admins(db, **kwargs):
        admin_calls.append(kwargs)
        return []

    monkeypatch.setattr(post_router, "notify_admins", fake_notify_admins)

    report = post_router.report_post(
        post.id,
        ReportCreate(reason="spam", details="Spam content"),
        current_user=reporter,
        db=db,
    )

    assert report.post_id == post.id
    assert admin_calls[0]["notification_type"] == "post_report"
    assert admin_calls[0]["actor_id"] == reporter.id
    assert owner_calls[0]["notification_type"] == "post_reported"
    assert owner_calls[0]["user_id"] == post.user_id


def test_report_resolution_hides_post_and_notifies_author_and_reporter(monkeypatch):
    admin = make_user("admin-id", "admin", role="admin")
    post = make_post(user_id="author-id")
    report = Report(
        id=99,
        reporter_id="reporter-id",
        post_id=post.id,
        comment_id=None,
        reason="spam",
        status="pending",
    )
    db = FakeSession({Report: [report], Post: [post]})
    calls = collect_notifications(monkeypatch, admin_router)

    response = admin_router.moderate_report(
        report.id,
        ReportModerate(status="resolved", action="hide_post", notes="Hidden"),
        current_user=admin,
        db=db,
    )

    assert response.status == "resolved"
    assert post.status == "rejected"
    assert [call["notification_type"] for call in calls] == ["post_moderation", "report_update"]
    assert calls[0]["user_id"] == post.user_id
    assert calls[0]["title"] == "Your post was hidden"
    assert calls[1]["user_id"] == report.reporter_id
    assert calls[1]["title"] == "Your report has been reviewed"


def test_user_can_list_unread_and_mark_notification_read():
    current_user = make_user("target-id", "target")
    unread = Notification(
        id=1,
        user_id=current_user.id,
        actor_id="actor-id",
        type="post_like",
        title="Your post was liked",
        message=None,
        is_read=False,
        created_at=utc_now_naive(),
    )
    db = FakeSession({Notification: [unread]})

    notifications = user_router.get_my_notifications(unread_only=True, current_user=current_user, db=db)
    updated = user_router.mark_notification_read(unread.id, current_user=current_user, db=db)

    assert notifications == [unread]
    assert updated.is_read is True
    assert db.commits == 1


def test_user_can_delete_read_notification():
    current_user = make_user("target-id", "target")
    read_notification = Notification(
        id=2,
        user_id=current_user.id,
        actor_id="actor-id",
        type="report_update",
        title="Your report has been reviewed",
        message=None,
        is_read=True,
        created_at=utc_now_naive(),
    )
    db = FakeSession({Notification: [read_notification]})

    response = user_router.delete_read_notification(read_notification.id, current_user=current_user, db=db)

    assert response.message == "Notification deleted successfully."
    assert db.deleted == [read_notification]
    assert db.commits == 1
