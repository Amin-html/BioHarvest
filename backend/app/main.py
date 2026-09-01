from fastapi import FastAPI

app = FastAPI(title="BioHarvest")

@app.get("/health/")
async def health():
    return {
        "status": "ok"
    }