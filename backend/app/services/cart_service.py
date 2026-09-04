from fastapi import HTTPException, status
from app.repositories.cart_repository import CartRepository

class CartService:
    def __init__(self, repo: CartRepository):
        self.repo = repo

    async def get_cart(self, user_id: int):
        return await self.repo.get_or_create_cart(user_id)

    async def add_item(self, user_id: int, product_id: int, quantity: int):
        cart = await self.repo.get_or_create_cart(user_id)
        existing = await self.repo.get_item(cart.id, product_id)
        if existing:
            await self.repo.update_quantity(existing, existing.quantity + quantity)
            return existing
        return await self.repo.add_item(cart.id, product_id, quantity)

    async def update_item(self, user_id: int, item_id: int, quantity: int):
        item = await self.repo.get_item_by_id(item_id)
        cart = await self.repo.get_or_create_cart(user_id)
        if item is None or item.cart_id != cart.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found")
        await self.repo.update_quantity(item, quantity)
        return item

    async def delete_item(self, user_id: int, item_id: int):
        item = await self.repo.get_item_by_id(item_id)
        cart = await self.repo.get_or_create_cart(user_id)
        if item is None or item.cart_id != cart.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found")
        await self.repo.delete_item(item)

    async def clear_cart(self, user_id: int):
        cart = await self.repo.get_or_create_cart(user_id)
        await self.repo.clear(cart.id)