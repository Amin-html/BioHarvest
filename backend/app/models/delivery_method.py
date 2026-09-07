import enum
from sqlalchemy import ForeignKey, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class DeliveryType(str, enum.Enum):
    PICKUP = "PICKUP"
    COURIER = "COURIER"
    REGIONAL = "REGIONAL"

class DeliveryMethod(Base):
    __tablename__ = "delivery_methods"

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("delivery_zones.id"))
    type: Mapped[DeliveryType] = mapped_column(Enum(DeliveryType))
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    eta_days: Mapped[int]