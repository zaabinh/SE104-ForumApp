from passlib.context import CryptContext

# Use argon2 instead of bcrypt - it's more reliable and doesn't have the 72-byte limit
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password with argon2."""
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against argon2 hash."""
    return pwd_context.verify(password, hashed)