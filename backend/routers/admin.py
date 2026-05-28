from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import require_role
from models.admin_audit_log import AdminAuditLog
from models.comment import Comment
from models.post import Post
from models.report import Report
from models.tag import Tag
from models.user import User
from schemas.auth_schema import MessageResponse
from schemas.common_schema import PaginationMeta
from schemas.report_schema import ReportModerate, ReportResponse
from schemas.tag_schema import TagCreate, TagResponse, TagUpdate
from services.notification_service import create_notification
from services.post_service import slugify


router = APIRouter(prefix="/admin", tags=["Admin"])


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str | None
    email: str
    full_name: str
    role: str
    status: str
    created_at: datetime


class AdminUsersListResponse(BaseModel):
    items: list[AdminUserResponse]
    meta: PaginationMeta


class AdminReportsListResponse(BaseModel):
    items: list[ReportResponse]
    meta: PaginationMeta


class AdminPostModerationResponse(BaseModel):
    id: int
    user_id: str
    title: str
    status: str
    created_at: datetime


class AdminPostsListResponse(BaseModel):
    items: list[AdminPostModerationResponse]
    meta: PaginationMeta


class AdminAnalyticsResponse(BaseModel):
    users_today: int
    users_week: int
    posts_today: int
    posts_week: int
    comments_today: int
    comments_week: int
    reports_today: int
    reports_week: int
    pending_reports: int
    pending_posts: int


def build_pagination_meta(page: int, page_size: int, total: int) -> PaginationMeta:
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)


def add_admin_audit_log(
    db: Session,
    admin_user_id: str,
    action_type: str,
    target_type: str,
    target_id: str,
    notes: str | None = None,
) -> None:
    db.add(
        AdminAuditLog(
            admin_user_id=admin_user_id,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            notes=notes,
        )
    )


@router.get("/users", response_model=AdminUsersListResponse)
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, pattern="^(active|banned|deleted)$"),
    sort_by: str = Query(default="created_at", pattern="^(created_at|username|email)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    query = db.query(User)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((User.username.ilike(term)) | (User.email.ilike(term)) | (User.full_name.ilike(term)))
    if status_filter:
        query = query.filter(func.lower(User.status) == status_filter.lower())

    sort_map = {
        "created_at": User.created_at,
        "username": User.username,
        "email": User.email,
    }
    sort_col = sort_map[sort_by]
    query = query.order_by(sort_col.asc() if sort_order == "asc" else sort_col.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return AdminUsersListResponse(items=items, meta=build_pagination_meta(page, page_size, total))


@router.post("/users/{user_id}/ban", response_model=AdminUserResponse)
def ban_user(
    user_id: str,
    reason: str | None = Query(default=None),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.status = "banned"
    add_admin_audit_log(db, current_user.id, "ban_user", "user", user_id, reason)
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
    reason: str | None = Query(default=None),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.status = "active"
    add_admin_audit_log(db, current_user.id, "unban_user", "user", user_id, reason)
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


@router.get("/reports", response_model=AdminReportsListResponse)
def list_reports(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, pattern="^(pending|reviewed|dismissed|resolved)$"),
    reason: str | None = Query(default=None),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    if reason:
        query = query.filter(Report.reason == reason)
    query = query.order_by(Report.created_at.desc(), Report.id.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return AdminReportsListResponse(items=items, meta=build_pagination_meta(page, page_size, total))


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
    report.reviewed_at = datetime.now(UTC).replace(tzinfo=None)
    add_admin_audit_log(
        db,
        current_user.id,
        "moderate_report",
        "report",
        str(report.id),
        f"status={payload.status}",
    )
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


@router.get("/posts/pending", response_model=AdminPostsListResponse)
def list_pending_posts(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    query = db.query(Post).filter(Post.status == "pending").order_by(Post.created_at.desc(), Post.id.desc())
    total = query.count()
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    items = [
        AdminPostModerationResponse(
            id=row.id,
            user_id=row.user_id,
            title=row.title,
            status=row.status,
            created_at=row.created_at,
        )
        for row in rows
    ]
    return AdminPostsListResponse(items=items, meta=build_pagination_meta(page, page_size, total))


@router.post("/posts/{post_id}/approve", response_model=MessageResponse)
def approve_post(
    post_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    post.status = "active"
    add_admin_audit_log(db, current_user.id, "approve_post", "post", str(post_id))
    db.commit()
    return MessageResponse(message="Post approved successfully.")


@router.post("/posts/{post_id}/reject", response_model=MessageResponse)
def reject_post(
    post_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    post.status = "rejected"
    add_admin_audit_log(db, current_user.id, "reject_post", "post", str(post_id))
    db.commit()
    return MessageResponse(message="Post rejected successfully.")


@router.get("/analytics/overview", response_model=AdminAnalyticsResponse)
def analytics_overview(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    _ = current_user.id
    now = datetime.now(UTC).replace(tzinfo=None)
    day_start = now - timedelta(days=1)
    week_start = now - timedelta(days=7)

    return AdminAnalyticsResponse(
        users_today=db.query(func.count()).select_from(User).filter(User.created_at >= day_start).scalar() or 0,
        users_week=db.query(func.count()).select_from(User).filter(User.created_at >= week_start).scalar() or 0,
        posts_today=db.query(func.count()).select_from(Post).filter(and_(Post.created_at >= day_start, Post.status == "active")).scalar() or 0,
        posts_week=db.query(func.count()).select_from(Post).filter(and_(Post.created_at >= week_start, Post.status == "active")).scalar() or 0,
        comments_today=db.query(func.count()).select_from(Comment).filter(Comment.created_at >= day_start).scalar() or 0,
        comments_week=db.query(func.count()).select_from(Comment).filter(Comment.created_at >= week_start).scalar() or 0,
        reports_today=db.query(func.count()).select_from(Report).filter(Report.created_at >= day_start).scalar() or 0,
        reports_week=db.query(func.count()).select_from(Report).filter(Report.created_at >= week_start).scalar() or 0,
        pending_reports=db.query(func.count()).select_from(Report).filter(Report.status == "pending").scalar() or 0,
        pending_posts=db.query(func.count()).select_from(Post).filter(Post.status == "pending").scalar() or 0,
    )


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
