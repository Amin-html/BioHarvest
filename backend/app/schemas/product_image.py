from pydantic import BaseModel, ConfigDict

class ProductImageCreateIn(BaseModel):
    url: str
    position: int = 0
    is_primary: bool = False

class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    url: str
    position: int
    is_primary: bool
