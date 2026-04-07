import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles 

from database import Base, engine
from models import AuthSession, Bookmark, Comment, Follow, Post, User, Tag 
from routes.auth import router as auth_router
from routes.follow import router as follow_router
from routes.user import router as user_router
from routes.post import router as post_router
from routes.comment import router as comment_router
from routes.upload import router as upload_router 
from routes.tag import router as tag_router       

app = FastAPI(
    title="Student Forum API",
    version="1.0.0",
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# 2. Cấu hình Static Files
# Giúp truy cập ảnh qua: http://127.0.0.1:8000/uploads/ten-file.jpg
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "Student Forum API is running."}

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router)
app.include_router(post_router)
app.include_router(comment_router)
app.include_router(follow_router)
app.include_router(upload_router) 
app.include_router(tag_router)   
