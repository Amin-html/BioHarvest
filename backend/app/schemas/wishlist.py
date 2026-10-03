from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductOut

class WishlistItemAddIn(BaseModel):
    product_id: int

class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product: ProductOut

class WishlistOut(BaseModel):
    items: list[WishlistItemOut]
