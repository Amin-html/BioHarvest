from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)
    norms: Mapped[list["FertilizerNorm"]] = relationship(
        back_populates="crop", cascade="all, delete-orphan"
    )