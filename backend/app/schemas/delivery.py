from pydantic import BaseModel, ConfigDict

class DeliveryZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    region: str

class DeliveryMethodOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    zone_id: int
    type: str
    price: float
    eta_days: int