from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    DashboardSummaryOut, OrdersByStatusOut, RevenuePointOut, TopProductOut, LowStockItemOut,
)
from app.core.dependencies import require_role
from app.models.user import UserRole

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["admin-dashboard"],
    dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))],
)

@router.get("/summary", response_model=DashboardSummaryOut)
async def get_dashboard_summary(
    low_stock_threshold: int = Query(10, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = DashboardRepository(db)
    return DashboardSummaryOut(
        total_revenue=await repo.total_revenue(),
        total_orders=await repo.total_orders(),
        total_customers=await repo.total_customers(),
        orders_by_status=[
            OrdersByStatusOut(status=s, count=c) for s, c in await repo.orders_by_status()
        ],
        revenue_last_30_days=[
            RevenuePointOut(date=d, revenue=r) for d, r in await repo.revenue_last_30_days()
        ],
        top_products=[
            TopProductOut(product_id=pid, name=name, quantity_sold=qty, revenue=rev)
            for pid, name, qty, rev in await repo.top_products()
        ],
        low_stock=[
            LowStockItemOut(product_id=pid, name=name, available=avail)
            for pid, name, avail in await repo.low_stock(low_stock_threshold)
        ],
    )
