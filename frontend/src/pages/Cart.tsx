import { useState } from 'react'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../hooks/useCart'
import { useProducts } from '../hooks/useCatalog'
import { usePriceTiersForProducts, effectiveUnitPrice } from '../hooks/usePriceTiers'
import { useNavigate } from 'react-router-dom'
import { Trash2, Boxes } from 'lucide-react'
import type { CartItem, PriceTier } from '../types/api'

export function CartPage() {
  const { data: cart, isLoading } = useCart()
  const { data: products } = useProducts()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const navigate = useNavigate()

  const productIds = cart?.items.map((i) => i.product_id) ?? []
  const tierQueries = usePriceTiersForProducts(productIds)
  const tiersByProductId = new Map<number, PriceTier[]>()
  productIds.forEach((id, i) => tiersByProductId.set(id, tierQueries[i]?.data ?? []))

  if (isLoading) return <p className="text-gray-500">Загрузка корзины...</p>
  if (!cart || cart.items.length === 0) return <p className="text-gray-500">Корзина пуста.</p>

  function productName(productId: number) {
    return products?.find((p) => p.id === productId)?.name ?? `Товар #${productId}`
  }
  function retailPrice(productId: number) {
    return products?.find((p) => p.id === productId)?.price ?? 0
  }

  function lineUnitPrice(item: CartItem) {
    return effectiveUnitPrice(tiersByProductId.get(item.product_id), item.quantity, retailPrice(item.product_id))
  }

  const total = cart.items.reduce((sum, i) => sum + lineUnitPrice(i) * i.quantity, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Корзина</h1>
      <div className="space-y-3">
        {cart.items.map((item) => {
          const retail = retailPrice(item.product_id)
          const unitPrice = lineUnitPrice(item)
          const isWholesale = unitPrice < retail

          return (
            <div key={item.id} className="flex items-center justify-between border rounded-xl p-3 bg-white">
              <div>
                <p className="font-medium">{productName(item.product_id)}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  {isWholesale && <Boxes size={14} className="text-emerald-600" />}
                  <span className={isWholesale ? 'text-emerald-700 font-medium' : ''}>
                    {unitPrice} сом / шт
                  </span>
                  {isWholesale && <span className="text-gray-400 line-through">{retail} сом</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <QuantityInput item={item} updateItem={updateItem} />
                <button onClick={() => removeItem.mutate(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-bold">Итого: {total} сом</span>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-emerald-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-emerald-700"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  )
}

function QuantityInput({
  item,
  updateItem,
}: {
  item: CartItem
  updateItem: ReturnType<typeof useUpdateCartItem>
}) {
  // Локальный буфер: печатать/стирать можно свободно, на сервер летит только
  // финальное значение (blur/Enter), а не запрос на каждую нажатую клавишу.
  const [value, setValue] = useState(String(item.quantity))

  function commit() {
    const quantity = Math.max(1, Number(value) || 1)
    setValue(String(quantity))
    if (quantity !== item.quantity) {
      updateItem.mutate({ itemId: item.id, quantity })
    }
  }

  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-16 border rounded-lg px-2 py-1 text-center"
    />
  )
}