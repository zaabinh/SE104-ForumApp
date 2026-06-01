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
