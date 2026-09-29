from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserRegisterIn, UserLoginIn, UserOut, TokenOut
from app.core.dependencies import require_role, get_current_user
from app.models.user import UserRole, User
from app.core.config import settings
from app.core.rate_limit import limiter, rate_limit, too_many_requests

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db), RefreshTokenRepository(db))

REFRESH_COOKIE = "refresh_token"

# Защита от перебора паролей: ограничение по IP + блокировка конкретного email
# после серии неудачных входов (не зависит от смены IP атакующим).
LOGIN_MAX_FAILURES = 10
LOGIN_FAILURE_WINDOW = 15 * 60

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=UserOut,
             dependencies=[Depends(rate_limit("register", 10, 60 * 60))])
async def register(data: UserRegisterIn, service: AuthService = Depends(get_auth_service)):
    return await service.register(data.email, data.password)

@router.post("/login", response_model=TokenOut,
             dependencies=[Depends(rate_limit("login", 20, 60))])
async def login(data: UserLoginIn, response: Response, service: AuthService = Depends(get_auth_service)):
    fail_key = f"login-fail:{data.email.lower()}"
    retry = limiter.blocked_for(fail_key, LOGIN_MAX_FAILURES, LOGIN_FAILURE_WINDOW)
    if retry:
        raise too_many_requests(retry)
    try:
        access, raw_refresh = await service.login(data.email, data.password)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            limiter.add(fail_key)
        raise
    limiter.clear(fail_key)
    response.set_cookie(
        key=REFRESH_COOKIE, value=raw_refresh,
        httponly=True,
        secure=not settings.debug,
        samesite="lax" if settings.debug else "none",
        max_age=60 * 60 * 24 * 30,
        path="/api/v1/auth",
    )
    return TokenOut(access_token=access)

@router.post("/refresh", response_model=TokenOut,
             dependencies=[Depends(rate_limit("refresh", 60, 60))])
async def refresh(request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    raw_refresh = request.cookies.get(REFRESH_COOKIE)
    if not raw_refresh:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token")
    access, new_raw_refresh = await service.refresh(raw_refresh)
    response.set_cookie(
        key=REFRESH_COOKIE, value=new_raw_refresh,
        httponly=True,
        secure=not settings.debug,
        samesite="lax" if settings.debug else "none",
        max_age=60 * 60 * 24 * 30,
        path="/api/v1/auth",
    )
    return TokenOut(access_token=access)

@router.post("/logout")
async def logout(request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    raw_refresh = request.cookies.get(REFRESH_COOKIE)
    if raw_refresh:
        await service.logout(raw_refresh)
    response.delete_cookie(REFRESH_COOKIE)
    return {"status": "logged out"}