from pydantic import BaseModel, EmailStr, ConfigDict

class UserRegisterIn(BaseModel):
    email: EmailStr
    password: str

class UserLoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    role: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"