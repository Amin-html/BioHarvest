from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.repositories.user_repository import UserRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token_raw, hash_refresh_token, refresh_expiry,
)

class AuthService:
    def __init__(self, repo: UserRepository, refresh_repo: RefreshTokenRepository):
        self.repo = repo
        self.refresh_repo = refresh_repo

    async def register(self, email: str, password: str):
        existing = await self.repo.get_by_email(email)
        if existing:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")
        return await self.repo.create(email, hash_password(password))

    async def login(self, email: str, password: str):
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
        access = create_access_token(user.id, user.role.value)
        raw_refresh = create_refresh_token_raw()
        await self.refresh_repo.create(user.id, hash_refresh_token(raw_refresh), refresh_expiry())
        return access, raw_refresh

    async def refresh(self, raw_refresh: str):
        token_hash = hash_refresh_token(raw_refresh)
        token = await self.refresh_repo.get_valid_by_hash(token_hash)
        if not token or token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")

        # ротация: старый сразу гасим
        await self.refresh_repo.revoke(token)

        user = await self.repo.get_by_id(token.user_id)  # добавь этот метод в UserRepository
        new_access = create_access_token(user.id, user.role.value)
        new_raw_refresh = create_refresh_token_raw()
        await self.refresh_repo.create(user.id, hash_refresh_token(new_raw_refresh), refresh_expiry())
        return new_access, new_raw_refresh

    async def logout(self, raw_refresh: str):
        token_hash = hash_refresh_token(raw_refresh)
        token = await self.refresh_repo.get_valid_by_hash(token_hash)
        if token:
            await self.refresh_repo.revoke(token)