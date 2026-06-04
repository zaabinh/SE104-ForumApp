from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from utils.hash import hash_password


def create_demo_user() -> User:
    db: Session = SessionLocal()
    try:
        email = "demo@studentforum.dev"
        user = db.query(User).filter(User.email == email).first()
        if user:
            return user

        user = User(
            username="demo_user",
            email=email,
            password_hash=hash_password("demo1234"),
            full_name="Demo User",
            bio="Demo account for local development.",
            major="Computer Science",
            academic_year="K18",
            career_goal="Backend Engineer",
            interest_tags="python,fastapi,sql",
            role="Student",
            status="active",
            provider="local",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


if __name__ == "__main__":
    created = create_demo_user()
    print(f"Demo user ready: {created.email}")
