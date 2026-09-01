from sqlalchemy import ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Stock(Base):
    __tablename__ = "stock"
    __table_args__ = (
        CheckConstraint("current_stock >= 0", name="ck_current_stock_positive"),
        CheckConstraint("reserved_stock >= 0", name="ck_reserved_stock_positive"),
        CheckConstraint("reserved_stock <= current_stock", name="ck_reserved_le_current"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True)
    current_stock: Mapped[int] = mapped_column(default=0)
    reserved_stock: Mapped[int] = mapped_column(default=0)