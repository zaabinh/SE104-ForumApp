"""Initialize database tables"""
from database import Base, engine
from models import AuthSession, Bookmark, Comment, Follow, Post, User

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Database tables created successfully!")
