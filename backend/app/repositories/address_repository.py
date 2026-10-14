from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.address import Address

class AddressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(self, user_id: int) -> list[Address]:
        result = await self.db.execute(
            select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.id)
        )
        return list(result.scalars().all())

    async def get_owned(self, user_id: int, address_id: int) -> Address:
        address = await self.db.get(Address, address_id)
        if address is None or address.user_id != user_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Address not found")
        return address

    async def _clear_default(self, user_id: int) -> None:
        await self.db.execute(
            update(Address).where(Address.user_id == user_id, Address.is_default == True).values(is_default=False)  # noqa: E712
        )

    async def create(self, user_id: int, data: dict) -> Address:
        if data.get("is_default"):
            await self._clear_default(user_id)
        address = Address(user_id=user_id, **data)
        self.db.add(address)
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def update(self, user_id: int, address_id: int, data: dict) -> Address:
        address = await self.get_owned(user_id, address_id)
        if data.get("is_default"):
            await self._clear_default(user_id)
        for key, value in data.items():
            setattr(address, key, value)
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def delete(self, user_id: int, address_id: int) -> None:
        address = await self.get_owned(user_id, address_id)
        await self.db.delete(address)
        await self.db.commit()
