from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class FertilizerNorm(Base):
    __tablename__ = "fertilizer_norms"

    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id", ondelete="CASCADE"), index=True)
    crop: Mapped["Crop"] = relationship(back_populates="norms")

    fertilizer_name: Mapped[str]
    stage: Mapped[str]  # например, "До посадки", "Период цветения"
    # норма внесения на 1 сотку (100 м²), кг
    dosage_per_sotka_kg: Mapped[float] = mapped_column(Numeric(10, 3))
    note: Mapped[str | None] = mapped_column(default=None)

    recommended_product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), default=None
    )
    recommended_product: Mapped["Product"] = relationship()