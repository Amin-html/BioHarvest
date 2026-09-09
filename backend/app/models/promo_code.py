import enum
from datetime import datetime
from sqlalchemy import Numeric, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class DiscountType(str, enum.Enum):
    PERCENT = "PERCENT"
    FIXED = "FIXED"

class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True, index=True)
    discount_type: Mapped[DiscountType] = mapped_column(Enum(DiscountType))
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    valid_to: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    max_uses: Mapped[int]
    used_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)