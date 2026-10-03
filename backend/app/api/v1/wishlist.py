from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas.wishlist import WishlistOut, WishlistItemAddIn, WishlistItemOut
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

@router.get("/", response_model=WishlistOut)
async def get_wishlist(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    items = await WishlistRepository(db).list_for_user(user.id)
    return WishlistOut(items=items)

@router.post("/", response_model=WishlistItemOut, status_code=201)
async def add_to_wishlist(
    data: WishlistItemAddIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await WishlistRepository(db).add(user.id, data.product_id)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await WishlistRepository(db).remove(user.id, product_id)
