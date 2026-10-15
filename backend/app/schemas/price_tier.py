from pydantic import BaseModel, ConfigDict, Field

class PriceTierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    min_quantity: int
    unit_price: float

class PriceTierCreateIn(BaseModel):
    min_quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)

class PriceTierUpdateIn(BaseModel):
    min_quantity: int | None = Field(default=None, gt=0)
    unit_price: float | None = Field(default=None, gt=0)