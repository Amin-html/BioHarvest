from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ReviewCreateIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None

class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: str | None
    is_verified_purchase: bool
    status: str
    created_at: datetime

class ReviewSummaryOut(BaseModel):
    average_rating: float | None
    count: int
    items: list[ReviewOut]

class ReviewModerateIn(BaseModel):
    status: str  # "APPROVED" | "REJECTED"
