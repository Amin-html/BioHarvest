from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    products: Mapped[list["Product"]] = relationship(back_populates="category")
    name: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)