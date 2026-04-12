from sqlalchemy.orm import Session

from models.notification import Notification


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
