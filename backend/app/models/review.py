import enum
from datetime import datetime
from sqlalchemy import ForeignKey, CheckConstraint, UniqueConstraint, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating_range"),
        UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    rating: Mapped[int]
    comment: Mapped[str | None] = mapped_column(default=None)
    is_verified_purchase: Mapped[bool] = mapped_column(default=False)
    status: Mapped[ReviewStatus] = mapped_column(Enum(ReviewStatus), default=ReviewStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship()
