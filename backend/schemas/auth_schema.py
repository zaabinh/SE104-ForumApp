from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)


class LoginRequest(BaseModel):
    identifier: str
    password: str = Field(..., min_length=6, max_length=128)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=12)
    password: str = Field(..., min_length=6, max_length=128)


class CompleteProfileRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=255)
    avatar_url: str | None = None
    bio: str | None = None
    major: str | None = Field(default=None, max_length=120)
    academic_year: str | None = Field(default=None, max_length=30)
    career_goal: str | None = Field(default=None, max_length=200)
    interest_tags: list[str] = Field(default_factory=list, max_length=20)


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=12)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'
    expires_in: int


class MessageResponse(BaseModel):
    message: str


class ForgotPasswordResponse(MessageResponse):
    reset_token: str | None = None


class VerificationResponse(MessageResponse):
    verification_token: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str | None
    email: EmailStr
    full_name: str
    avatar_url: str | None = None
    bio: str | None = None
    major: str | None = None
    academic_year: str | None = None
    career_goal: str | None = None
    interest_tags: list[str] = Field(default_factory=list)
    role: str
    status: str
    provider: str
    is_verified: bool

    @field_validator("interest_tags", mode="before")
    @classmethod
    def normalize_interest_tags(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []


class CurrentUserResponse(UserResponse):
    profile_completed: bool
