from fastapi import APIRouter, Depends, Header, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.order import OrderOut
from app.services.order_service import OrderService
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_repository import StockRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.delivery_repository import DeliveryRepository
from app.repositories.promo_code_repository import PromoCodeRepository
from app.schemas.order import OrderStatusUpdateIn

router = APIRouter(prefix="/orders", tags=["orders"])
admin_router = APIRouter(
    prefix="/admin/orders",
    tags=["admin-orders"],
    dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))],
)



def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        cart_repo=CartRepository(db),
        product_repo=ProductRepository(db),
        stock_repo=StockRepository(db),
        order_repo=OrderRepository(db),
        delivery_repo=DeliveryRepository(db),
        promo_repo=PromoCodeRepository(db),
    )

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def checkout(
    delivery_method_id: int | None = Query(None),
    promo_code: str | None = Query(None),
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
):
    return await service.checkout(current_user.id, idempotency_key, delivery_method_id, promo_code)

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

@router.post("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(
        order_id: int,
        current_user: User = Depends(get_current_user),
        service: OrderService = Depends(get_order_service),
):
    return await service.cancel_order(current_user.id, order_id)

@admin_router.get("/", response_model=list[OrderOut])
async def list_all_orders(service: OrderService = Depends(get_order_service)):
    return await service.order_repo.get_all()

@admin_router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdateIn,
    service: OrderService = Depends(get_order_service),
):
    return await service.admin_update_status(order_id, data.status)