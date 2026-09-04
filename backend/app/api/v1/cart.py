from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.cart import CartOut, CartItemAddIn, CartItemUpdateIn
from app.services.cart_service import CartService
from app.repositories.cart_repository import CartRepository

router = APIRouter(prefix="/cart", tags=["cart"])

def get_cart_service(db: AsyncSession = Depends(get_db)) -> CartService:
    return CartService(CartRepository(db))

@router.get("/", response_model=CartOut)
async def get_cart(
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    return await service.get_cart(current_user.id)

@router.post("/items/", response_model=CartOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    data: CartItemAddIn,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    await service.add_item(current_user.id, data.product_id, data.quantity)
    return await service.get_cart(current_user.id)

@router.patch("/items/{item_id}", response_model=CartOut)
async def update_item(
    item_id: int,
    data: CartItemUpdateIn,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    await service.update_item(current_user.id, item_id, data.quantity)
    return await service.get_cart(current_user.id)

@router.delete("/items/{item_id}", response_model=CartOut)
async def remove_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    await service.delete_item(current_user.id, item_id)
    return await service.get_cart(current_user.id)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    await service.clear_cart(current_user.id)