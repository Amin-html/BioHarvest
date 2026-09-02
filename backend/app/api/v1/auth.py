from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserRegisterIn, UserLoginIn, UserOut, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(data: UserRegisterIn, db: AsyncSession = Depends(get_db)):
    service = AuthService(UserRepository(db))
    return await service.register(data.email, data.password)

@router.post("/login", response_model=TokenOut)
async def login(data: UserLoginIn, db: AsyncSession = Depends(get_db)):
    service = AuthService(UserRepository(db))
    token = await service.login(data.email, data.password)
    return TokenOut(access_token=token)