from pydantic import BaseModel, ConfigDict

class CartItemAddIn(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdateIn(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: int

class CartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    items: list[CartItemOut]