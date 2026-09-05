from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.order import OrderOut
from app.services.order_service import OrderService
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_repository import StockRepository
from app.repositories.order_repository import OrderRepository

router = APIRouter(prefix="/orders", tags=["orders"])

def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    # ВСЕ repository получают ОДИН db — это гарантирует одну транзакцию
    return OrderService(
        cart_repo=CartRepository(db),
        product_repo=ProductRepository(db),
        stock_repo=StockRepository(db),
        order_repo=OrderRepository(db),
    )

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def checkout(
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
):
    return await service.checkout(current_user.id, idempotency_key)

@router.get("/", response_model=list[OrderOut])
async def list_my_orders(
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
):
    return await service.order_repo.get_all_for_user(current_user.id)

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
):
    order = await service.order_repo.get_by_id(order_id)
    if order is None or order.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return order