"""Production-ready Student Forum Backend."""

import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import Base, engine
from models import (
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
from routers import admin, auth, comment, follow, post, user

# Create all tables
Base.metadata.create_all(bind=engine)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Student Forum API Starting...")
    yield
    print("🛑 Student Forum API Shutting Down...")

# Create FastAPI application
app = FastAPI(
    title="Student Forum API",
    description="Production-ready backend for student forum system with posts, comments, and follow system",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth")
app.include_router(user.router)
app.include_router(post.router, prefix="/api")
app.include_router(comment.router, prefix="/api")
app.include_router(follow.router)
app.include_router(admin.router, prefix="/api")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Student Forum API is running"
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Student Forum API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi_schema": "/openapi.json",
        "endpoints": {
            "posts": "/api/posts",
            "comments": "/api/comments",
            "follow": "/api/follow",
            "feed": "/api/feed",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

