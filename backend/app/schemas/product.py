from pydantic import BaseModel, ConfigDict

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    price: float
    is_active: bool