import os


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:3000")


def build_verification_link(token: str) -> str:
    return f"{FRONTEND_URL}/verify-email?token={token}"


def build_password_reset_link(token: str) -> str:
    return f"{FRONTEND_URL}/reset-password?token={token}"


def send_email_message(recipient: str, subject: str, body: str) -> None:
    # Development-safe placeholder: integrate a real email provider later.
    print(f"[EMAIL] To: {recipient}")
    print(f"[EMAIL] Subject: {subject}")
    print(body)
