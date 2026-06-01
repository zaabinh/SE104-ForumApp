from pydantic import BaseModel, Field
from schemas.post_schema import PostResponse
from schemas.common_schema import PaginationMeta


class TrendingPostResponse(BaseModel):
    """Thông tin bài viết trending"""
    post: PostResponse
    trend_rank: int = Field(..., description="Xếp hạng xu hướng (1 = hot nhất)")
    hot_score: float = Field(..., description="Điểm hot của bài viết")
    trending_reason: str = Field(..., description="Lý do bài viết trending")


class TrendingPostListResponse(BaseModel):
    """Danh sách bài viết trending"""
    items: list[TrendingPostResponse]
    meta: PaginationMeta


class TrendingTagResponse(BaseModel):
    """Tag đang xu hướng"""
    tag_name: str
    post_count: int = Field(..., description="Số bài viết có tag này")
    trend_score: float = Field(..., description="Điểm xu hướng")


class TrendingTagListResponse(BaseModel):
    """Danh sách tag trending"""
    items: list[TrendingTagResponse]
    updated_at: str = Field(..., description="Thời gian cập nhật")


class SimilarPostResponse(BaseModel):
    """Bài viết tương tự"""
    post: PostResponse
    similarity_score: float = Field(..., description="Điểm tương đồng (0-1)")
    similarity_reason: str = Field(..., description="Lý do bài tương tự")


class SimilarPostListResponse(BaseModel):
    """Danh sách bài viết tương tự"""
    items: list[SimilarPostResponse]
    meta: PaginationMeta


class CollaborativePostResponse(BaseModel):
    """Bài viết từ Collaborative Filtering"""
    post: PostResponse
    cf_score: float = Field(..., description="Điểm collaborative filtering")
    cf_reason: str = Field(..., description="Lý do gợi ý")
    similar_user_count: int = Field(default=0, description="Số user tương tự yêu thích bài này")


class CollaborativePostListResponse(BaseModel):
    """Danh sách bài viết từ Collaborative Filtering"""
    items: list[CollaborativePostResponse]
    meta: PaginationMeta


class UserSimilarityInfo(BaseModel):
    """Thông tin user tương tự"""
    user_id: str
    username: str
    full_name: str
    avatar_url: str | None
    similarity_score: float = Field(..., description="Điểm tương đồng (0-1)")
    common_tags: list[str] = Field(default_factory=list)
    common_liked_posts: int = Field(default=0)


class ProfileBasedPostResponse(BaseModel):
    """Bài viết từ Profile-Based Filtering"""
    post: PostResponse
    profile_score: float = Field(..., description="Điểm liên quan profile (0-1)")
    recommendation_reason: str = Field(..., description="Lý do gợi ý")


class ProfileBasedPostListResponse(BaseModel):
    """Danh sách bài viết từ Profile-Based Filtering"""
    items: list[ProfileBasedPostResponse]
    meta: PaginationMeta


class UserProfileSummary(BaseModel):
    """Tóm tắt profile của user"""
    interest_tags: list[str] = Field(default_factory=list)
    major: str = ""
    academic_year: str = ""
    career_goal: str = ""
    profile_strength: float = Field(..., description="Độ đầy đủ profile (0-1)")
    recommendations_count: int = Field(default=0)
    profile_completeness: dict = Field(default_factory=dict)


class ProfileAnalysisResponse(BaseModel):
    """Kết quả phân tích profile chi tiết"""
    user_id: str
    profile_summary: UserProfileSummary
    recommendation_message: str = "Gợi ý dựa trên thông tin profile của bạn"


