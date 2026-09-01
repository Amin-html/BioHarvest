from fastapi import FastAPI
from app.api.v1.products import router as products_router

app = FastAPI(title="BioHarvest")
app.include_router(products_router, prefix="/api/v1")

@app.get("/health/")
async def health():
    return {
        "status": "ok"
    }