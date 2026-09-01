from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Numeric, ForeignKey
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    category: Mapped["Category"] = relationship(back_populates="products")
    name: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(default=True)