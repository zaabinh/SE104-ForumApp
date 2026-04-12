from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal
from models.user import User
from utils.hash import hash_password

def create_admin():
    db: Session = SessionLocal()

    try:
        # Check admin tồn tại chưa
        existing_admin = db.query(User).filter(User.role == "admin").first()

        if existing_admin:
            print("✅ Admin already exists")
            return

        # Tạo admin
        admin = User(
        email="admin@example.com",
        username="admin",
        full_name="Administrator",  # 🔥 thêm dòng này
        password_hash=hash_password("admin123"),
        role="Admin",
        status="active",
        is_verified=True,
        provider="local"
    )

        db.add(admin)
        db.commit()

        print("🚀 Admin created successfully!")
        print("Email: admin@example.com")
        print("Password: admin123")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()