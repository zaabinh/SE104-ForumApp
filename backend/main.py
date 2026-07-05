"""Student Forum Backend entrypoint."""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
from models import (
    AdminAuditLog,
    AuthSession,
    Bookmark,
    Comment,
    EmailVerificationToken,
    Follow,
    Notification,
    PasswordResetToken,
    Post,
    PostLike,
    PostShare,
    PostTag,
    PostView,
    Report,
    Tag,
    User,
)
from routers import admin, auth, comment, follow, post, upload, user


load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

_ = (
    AdminAuditLog,
    AuthSession,
    Bookmark,
    Comment,
    EmailVerificationToken,
    Follow,
    Notification,
    PasswordResetToken,
    Post,
    PostLike,
    PostShare,
    PostTag,
    PostView,
    Report,
    Tag,
    User,
)


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins = [item.strip() for item in raw.split(",") if item.strip()]
    if not origins:
        raise RuntimeError("Missing CORS_ALLOWED_ORIGINS in environment.")
    return origins


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Student Forum API starting...")
    yield
    print("Student Forum API shutting down...")


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Forum API",
    description="Backend for student forum system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(user.router)
app.include_router(post.router, prefix="/api")
app.include_router(comment.router, prefix="/api")
app.include_router(follow.router)
app.include_router(admin.router, prefix="/api")
app.include_router(upload.router)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Student Forum API is running"}


@app.get("/")
async def root():
    return {
        "message": "Welcome to Student Forum API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi_schema": "/openapi.json",
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True, log_level="info")
