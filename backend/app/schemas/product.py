from pydantic import BaseModel, ConfigDict

class ProductCreateIn(BaseModel):
    name: str
    slug: str
    price: float
    category_id: int
    is_active: bool = True

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    price: float
    is_active: bool