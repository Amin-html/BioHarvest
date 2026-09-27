from pydantic import BaseModel, ConfigDict
from app.schemas.product_image import ProductImageOut

class ProductCreateIn(BaseModel):
    name: str
    slug: str
    price: float
    category_id: int
    description: str | None = None
    is_active: bool = True

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    price: float
    category_id: int
    description: str | None = None
    is_active: bool
    images: list[ProductImageOut] = []

class ProductUpdateIn(BaseModel):
    name: str | None = None
    price: float | None = None
    category_id: int | None = None
    description: str | None = None
    is_active: bool | None = None