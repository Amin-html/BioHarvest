from datetime import date
from pydantic import BaseModel

class OrdersByStatusOut(BaseModel):
    status: str
    count: int

class RevenuePointOut(BaseModel):
    date: date
    revenue: float

class TopProductOut(BaseModel):
    product_id: int
    name: str
    quantity_sold: int
    revenue: float

class LowStockItemOut(BaseModel):
    product_id: int
    name: str
    available: int

class DashboardSummaryOut(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    orders_by_status: list[OrdersByStatusOut]
    revenue_last_30_days: list[RevenuePointOut]
    top_products: list[TopProductOut]
    low_stock: list[LowStockItemOut]
