from pydantic import BaseModel, ConfigDict, Field

class AddressCreateIn(BaseModel):
    label: str | None = None
    full_address: str = Field(min_length=1)
    city: str | None = None
    phone: str | None = None
    is_default: bool = False

class AddressUpdateIn(BaseModel):
    label: str | None = None
    full_address: str | None = None
    city: str | None = None
    phone: str | None = None
    is_default: bool | None = None

class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    label: str | None
    full_address: str
    city: str | None
    phone: str | None
    is_default: bool
