import os

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from utils.hash import hash_password


load_dotenv()


def create_admin():
    db: Session = SessionLocal()
    admin_email = os.getenv("SEED_ADMIN_EMAIL")
    admin_username = os.getenv("SEED_ADMIN_USERNAME")
    admin_password = os.getenv("SEED_ADMIN_PASSWORD")
    admin_full_name = os.getenv("SEED_ADMIN_FULL_NAME", "Administrator")

    if not admin_email or not admin_username or not admin_password:
        raise RuntimeError("Missing SEED_ADMIN_EMAIL/SEED_ADMIN_USERNAME/SEED_ADMIN_PASSWORD in environment.")

    try:
        existing_admin = db.query(User).filter(User.role == "Admin").first()
        if existing_admin:
            print("Admin already exists")
            return

        admin = User(
            email=admin_email.strip().lower(),
            username=admin_username.strip().lower(),
            full_name=admin_full_name.strip(),
            password_hash=hash_password(admin_password),
            role="Admin",
            status="active",
            is_verified=True,
            provider="local",
        )
        db.add(admin)
        db.commit()
        print("Admin created successfully")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
