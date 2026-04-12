from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    actor_id: str | None
    type: str
    title: str
    message: str | None
    is_read: bool
    post_id: int | None
    comment_id: int | None
    report_id: int | None
    created_at: datetime
