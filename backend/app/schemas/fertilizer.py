from pydantic import BaseModel, ConfigDict, Field
from app.schemas.product import ProductOut

class CropOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str

class FertilizerNormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    fertilizer_name: str
    stage: str
    dosage_per_sotka_kg: float
    note: str | None = None
    recommended_product: ProductOut | None = None

class FertilizerCalculateIn(BaseModel):
    crop_id: int
    area: float = Field(gt=0)
    area_unit: str = "sotka"  # "sotka" | "hectare" | "m2"

class FertilizerCalculationItemOut(BaseModel):
    fertilizer_name: str
    stage: str
    note: str | None = None
    amount_kg: float
    recommended_product: ProductOut | None = None

class FertilizerCalculationOut(BaseModel):
    crop: CropOut
    area_sotka: float
    items: list[FertilizerCalculationItemOut]