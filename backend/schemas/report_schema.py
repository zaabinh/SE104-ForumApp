from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    post_id: int | None = None
    comment_id: int | None = None
    reason: Literal["spam", "harassment", "hate_speech", "violence", "misinformation", "other"]
    details: str | None = Field(default=None, max_length=2000)


class ReportModerate(BaseModel):
    status: str = Field(..., pattern="^(pending|reviewed|dismissed|resolved)$")


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reporter_id: str | None
    post_id: int | None
    comment_id: int | None
    reason: str
    details: str | None
    status: str
    reviewed_by: str | None
    reviewed_at: datetime | None
    created_at: datetime
