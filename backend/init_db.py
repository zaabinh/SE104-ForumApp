"""Initialize database tables"""
from database import Base, engine
from models import AuthSession, Bookmark, Comment, Follow, Post, User

# Drop existing tables and recreate (for idempotency)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("✅ Database tables recreated successfully!")
