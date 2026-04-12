from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    post_id: int | None = None
    comment_id: int | None = None
    reason: str = Field(..., min_length=2, max_length=100)
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
