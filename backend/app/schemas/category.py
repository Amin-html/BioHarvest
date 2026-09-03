from pydantic import BaseModel, ConfigDict

class CategoryCreateIn(BaseModel):
    name: str
    slug: str

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str