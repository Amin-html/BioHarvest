from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import UserRole
from app.repositories.stock_repository import StockRepository
from app.schemas.stock import StockOut, StockCreateIn, StockAdjustIn

router = APIRouter(
    prefix="/admin/stock",
    tags=["admin-stock"],
    dependencies=[Depends(require_role(UserRole.STAFF, UserRole.ADMIN))],
)

@router.post("/", response_model=StockOut, status_code=201)
async def create_stock(data: StockCreateIn, db: AsyncSession = Depends(get_db)):
    return await StockRepository(db).create(data.product_id, data.current_stock)

@router.get("/{product_id}", response_model=StockOut)
async def get_stock(product_id: int, db: AsyncSession = Depends(get_db)):
    stock = await StockRepository(db).get_by_product_id(product_id)
    if stock is None:
        raise HTTPException(404, "Stock not found")
    return stock

@router.patch("/{product_id}/adjust", response_model=StockOut)
async def adjust_stock(product_id: int, data: StockAdjustIn, db: AsyncSession = Depends(get_db)):
    return await StockRepository(db).adjust(product_id, data.quantity)