from datetime import datetime
from pydantic import BaseModel, ConfigDict

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name_snapshot: str
    unit_price_snapshot: float
    quantity: int
    line_total: float

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    subtotal: float
    total: float
    created_at: datetime
    items: list[OrderItemOut]