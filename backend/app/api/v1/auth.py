from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserRegisterIn, UserLoginIn, UserOut, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db), RefreshTokenRepository(db))

REFRESH_COOKIE = "refresh_token"

@router.post("/register", response_model=UserOut)
async def register(data: UserRegisterIn, service: AuthService = Depends(get_auth_service)):
    return await service.register(data.email, data.password)

@router.post("/login", response_model=TokenOut)
async def login(data: UserLoginIn, response: Response, service: AuthService = Depends(get_auth_service)):
    access, raw_refresh = await service.login(data.email, data.password)
    response.set_cookie(
        key=REFRESH_COOKIE, value=raw_refresh,
        httponly=True, secure=True, samesite="strict",
        max_age=60 * 60 * 24 * 30,
    )
    return TokenOut(access_token=access)

@router.post("/refresh", response_model=TokenOut)
async def refresh(request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    raw_refresh = request.cookies.get(REFRESH_COOKIE)
    if not raw_refresh:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token")
    access, new_raw_refresh = await service.refresh(raw_refresh)
    response.set_cookie(
        key=REFRESH_COOKIE, value=new_raw_refresh,
        httponly=True, secure=True, samesite="strict",
        max_age=60 * 60 * 24 * 30,
    )
    return TokenOut(access_token=access)

@router.post("/logout")
async def logout(request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    raw_refresh = request.cookies.get(REFRESH_COOKIE)
    if raw_refresh:
        await service.logout(raw_refresh)
    response.delete_cookie(REFRESH_COOKIE)
    return {"status": "logged out"}