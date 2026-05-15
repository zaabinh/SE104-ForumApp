from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from utils.hash import hash_password


def create_demo_user():

    db: Session = SessionLocal()

    try:

        existing_user = db.query(User).filter(
            User.email == "mail@gmail.com"
        ).first()

        if existing_user:
            print("✅ User already exists")
            return

        user = User(
            email="mail@gmail.com",
            username="username",
            full_name="Demo User",
            bio="Demo account for testing",
            avatar_url="https://api.dicebear.com/7.x/notionists/png?seed=username",
            password_hash=hash_password("abc@123"),
            role="Student",
            status="active",
            provider="local",
            is_verified=True
        )

        db.add(user)
        db.commit()

        print("================================")
        print("🚀 DEMO USER CREATED")
        print("================================")
        print("Email    : mail@gmail.com")
        print("Username : username")
        print("Password : abc@123")
        print("================================")

    except Exception as e:

        db.rollback()

        print("❌ ERROR")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    create_demo_user()