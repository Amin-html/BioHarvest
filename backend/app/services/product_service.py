from app.repositories.product_repository import ProductRepository

class ProductService:
    def __init__(self, repo: ProductRepository):
        self.repo = repo

    async def list_products(self):
        return await self.repo.get_all()

    async def create_product(self, data: dict):
        return await self.repo.create(data)