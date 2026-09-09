from pydantic import BaseModel, ConfigDict

class StockCreateIn(BaseModel):
    product_id: int
    current_stock: int = 0

class StockAdjustIn(BaseModel):
    quantity: int  # положительное — пополнение, отрицательное — списание

class StockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    current_stock: int
    reserved_stock: int