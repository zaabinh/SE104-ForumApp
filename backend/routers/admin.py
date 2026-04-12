from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_role
from models.report import Report
from models.tag import Tag
from models.user import User
from schemas.auth_schema import MessageResponse
from schemas.report_schema import ReportModerate, ReportResponse
from schemas.tag_schema import TagCreate, TagResponse, TagUpdate
from services.notification_service import create_notification
from services.post_service import slugify


router = APIRouter(prefix="/admin", tags=["Admin"])


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    full_name: str
    role: str
    status: str
    created_at: datetime


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users/{user_id}/ban", response_model=AdminUserResponse)
def ban_user(
    user_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.status = "Banned"
    create_notification(
        db,
        user_id=user.id,
        actor_id=current_user.id,
        notification_type="account_status",
        title="Your account has been banned",
        message="An administrator has restricted access to your account.",
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/unban", response_model=AdminUserResponse)
def unban_user(
    user_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.status = "Active"
    create_notification(
        db,
        user_id=user.id,
        actor_id=current_user.id,
        notification_type="account_status",
        title="Your account has been restored",
        message="An administrator restored your access.",
    )
    db.commit()
    db.refresh(user)
    return user


@router.get("/reports", response_model=list[ReportResponse])
def list_reports(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    return db.query(Report).order_by(Report.created_at.desc(), Report.id.desc()).all()


@router.post("/reports/{report_id}/moderate", response_model=ReportResponse)
def moderate_report(
    report_id: int,
    payload: ReportModerate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    report.status = payload.status
    report.reviewed_by = current_user.id
    report.reviewed_at = datetime.utcnow()
    if report.reporter_id:
        create_notification(
            db,
            user_id=report.reporter_id,
            actor_id=current_user.id,
            notification_type="report_update",
            title="Your report has been reviewed",
            message=f"Report #{report.id} was marked as {payload.status}.",
            report_id=report.id,
        )
    db.commit()
    db.refresh(report)
    return report


@router.get("/tags", response_model=list[TagResponse])
def list_tags(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    return db.query(Tag).order_by(Tag.name.asc()).all()


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    slug = slugify(payload.name)
    existing = db.query(Tag).filter((Tag.name == payload.name.strip().lower()) | (Tag.slug == slug)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already exists.")
    tag = Tag(name=payload.name.strip().lower(), slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/tags/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    payload: TagUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found.")
    tag.name = payload.name.strip().lower()
    tag.slug = slugify(payload.name)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/tags/{tag_id}", response_model=MessageResponse)
def delete_tag(
    tag_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found.")
    db.delete(tag)
    db.commit()
    return MessageResponse(message="Tag deleted successfully.")
