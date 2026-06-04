import os

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from utils.hash import hash_password


load_dotenv()


def create_admin() -> User:
    db: Session = SessionLocal()
    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@studentforum.dev").strip().lower()
    admin_username = os.getenv("SEED_ADMIN_USERNAME", "admin").strip().lower()
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "admin12345")
    admin_full_name = os.getenv("SEED_ADMIN_FULL_NAME", "Administrator").strip()

    try:
        existing_admin = db.query(User).filter(User.role.ilike("admin")).first()
        if existing_admin:
            return existing_admin

        admin = User(
            email=admin_email,
            username=admin_username,
            full_name=admin_full_name,
            password_hash=hash_password(admin_password),
            major="Computer Science",
            academic_year="K18",
            career_goal="Platform Admin",
            interest_tags="moderation,platform,operations",
            role="admin",
            status="active",
            provider="local",
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin
    finally:
        db.close()


if __name__ == "__main__":
    account = create_admin()
    print(f"Admin ready: {account.email}")
