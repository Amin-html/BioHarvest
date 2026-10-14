from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.address_repository import AddressRepository
from app.schemas.address import AddressOut, AddressCreateIn, AddressUpdateIn
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/addresses", tags=["addresses"])

@router.get("/", response_model=list[AddressOut])
async def list_addresses(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    return await AddressRepository(db).list_for_user(user.id)

@router.post("/", response_model=AddressOut, status_code=201)
async def create_address(
    data: AddressCreateIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await AddressRepository(db).create(user.id, data.model_dump())

@router.patch("/{address_id}", response_model=AddressOut)
async def update_address(
    address_id: int,
    data: AddressUpdateIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await AddressRepository(db).update(user.id, address_id, data.model_dump(exclude_unset=True))

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await AddressRepository(db).delete(user.id, address_id)
