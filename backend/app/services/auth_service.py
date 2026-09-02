from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token

class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, email: str, password: str):
        existing = await self.repo.get_by_email(email)
        if existing:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")
        user = await self.repo.create(email, hash_password(password))
        return user

    async def login(self, email: str, password: str) -> str:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
        return create_access_token(user.id, user.role.value)