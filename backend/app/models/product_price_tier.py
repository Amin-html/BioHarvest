from sqlalchemy import ForeignKey, Numeric, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ProductPriceTier(Base):
    __tablename__ = "product_price_tiers"
    __table_args__ = (
        CheckConstraint("min_quantity > 0", name="ck_price_tier_min_quantity_positive"),
        UniqueConstraint("product_id", "min_quantity", name="uq_price_tier_product_min_qty"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    product: Mapped["Product"] = relationship()

    # Оптовая цена за единицу при заказе от min_quantity штук (включительно).
    min_quantity: Mapped[int]
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))