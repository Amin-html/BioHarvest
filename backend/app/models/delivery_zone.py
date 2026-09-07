from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class DeliveryZone(Base):
    __tablename__ = "delivery_zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    region: Mapped[str]