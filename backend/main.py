from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models import AuthSession, Bookmark, Comment, Follow, Post, User
from routes.auth import router as auth_router
from routes.follow import router as follow_router
from routes.user import router as user_router


app = FastAPI(
    title="Student Forum API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
app.include_router(follow_router)
