import { useState } from 'react'
import { useProducts } from '../../hooks/useCatalog'
import {
  usePriceTiersForProducts,
  useCreatePriceTier,
  useDeletePriceTier,
} from '../../hooks/usePriceTiers'
import { Boxes, Plus, Trash2 } from 'lucide-react'
import type { Product, PriceTier } from '../../types/api'

export function AdminPriceTiersPage() {
  const { data: products, isLoading } = useProducts()
  const productIds = products?.map((p) => p.id) ?? []
  const tierQueries = usePriceTiersForProducts(productIds)

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Оптовые уровни цен: при заказе от указанного количества товар продаётся по сниженной
        цене за единицу. На кассе автоматически применяется самый выгодный подходящий уровень.
      </p>
      <div className="space-y-2">
        {products?.map((product, i) => (
          <ProductTiersRow
            key={product.id}
            product={product}
            tiers={tierQueries[i]?.data ?? []}
            isLoading={tierQueries[i]?.isLoading}
          />
        ))}
      </div>
    </div>
  )
}

function ProductTiersRow({
  product,
  tiers,
  isLoading,
}: {
  product: Product
  tiers: PriceTier[]
  isLoading?: boolean
}) {
  const createTier = useCreatePriceTier()
  const deleteTier = useDeletePriceTier()
  const [minQty, setMinQty] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    const min_quantity = Number(minQty)
    const unit_price = Number(unitPrice)
    if (!min_quantity || !unit_price) return
    try {
      await createTier.mutateAsync({ productId: product.id, min_quantity, unit_price })
      setMinQty('')
      setUnitPrice('')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось добавить уровень цены')
    }
  }

  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-gray-500">Розница: {product.price} сом/шт</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 mt-2">...</p>
      ) : (
        <>
          {tiers.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between text-sm bg-emerald-50 rounded-lg px-3 py-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Boxes size={14} />
                    от {tier.min_quantity} шт — {tier.unit_price} сом/шт
                  </span>
                  <button
                    onClick={() => deleteTier.mutate({ tierId: tier.id, productId: product.id })}
                    className="text-gray-400 hover:text-red-600"
                    title="Удалить уровень"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 mt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">От скольки шт</label>
              <input
                type="number"
                min={1}
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                placeholder="напр. 10"
                className="border rounded-lg px-2 py-1.5 w-28"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Цена за шт</label>
              <input
                type="number"
                min={0}
                step="any"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="напр. 850"
                className="border rounded-lg px-2 py-1.5 w-28"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={createTier.isPending}
              className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-lg px-3 py-1.5 font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              <Plus size={16} />
              Добавить уровень
            </button>
          </div>
        </>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}