from fastapi import FastAPI
from app.api.v1.products import router as products_router
from app.api.v1.category import router as category_router
from app.api.v1.auth import router as authorization_router
from app.api.v1.cart import router as cart_router
from app.api.v1.orders import router as order_router

app = FastAPI(title="BioHarvest")
app.include_router(products_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(authorization_router, prefix="/api/v1")
app.include_router(cart_router, prefix="/api/v1")
app.include_router(order_router, prefix="/api/v1")

@app.get("/health/")
async def health():
    return {
        "status": "ok"
    }