from sqlalchemy.orm import Session

from models.follow import Follow
from models.notification import Notification
from models.user import User


def create_notification(
    db: Session,
    *,
    user_id: str,
    actor_id: str | None,
    notification_type: str,
    title: str,
    message: str | None = None,
    post_id: int | None = None,
    comment_id: int | None = None,
    report_id: int | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        actor_id=actor_id,
        type=notification_type,
        title=title,
        message=message,
        post_id=post_id,
        comment_id=comment_id,
        report_id=report_id,
    )
    db.add(notification)
    return notification


def notify_admins(
    db: Session,
    *,
    actor_id: str | None,
    notification_type: str,
    title: str,
    message: str | None = None,
    post_id: int | None = None,
    comment_id: int | None = None,
    report_id: int | None = None,
) -> list[Notification]:
    admins = db.query(User).filter(User.role.ilike("admin"), User.status == "active").all()
    notifications: list[Notification] = []
    for admin in admins:
        if actor_id and admin.id == actor_id:
            continue
        notifications.append(
            create_notification(
                db,
                user_id=admin.id,
                actor_id=actor_id,
                notification_type=notification_type,
                title=title,
                message=message,
                post_id=post_id,
                comment_id=comment_id,
                report_id=report_id,
            )
        )
    return notifications


def notify_followers(
    db: Session,
    *,
    author_id: str,
    notification_type: str,
    title: str,
    message: str | None = None,
    post_id: int | None = None,
) -> list[Notification]:
    follows = db.query(Follow).filter(Follow.following_id == author_id).all()
    notifications: list[Notification] = []
    for follow in follows:
        if follow.follower_id == author_id:
            continue
        notifications.append(
            create_notification(
                db,
                user_id=follow.follower_id,
                actor_id=author_id,
                notification_type=notification_type,
                title=title,
                message=message,
                post_id=post_id,
            )
        )
    return notifications
