import { usePendingReviews, useModerateReview } from '../../hooks/useReviews'
import { useProducts } from '../../hooks/useCatalog'
import { Star, Check, X } from 'lucide-react'

export function AdminReviewsPage() {
  const { data: reviews, isLoading } = usePendingReviews()
  const { data: products } = useProducts()
  const moderate = useModerateReview()

  function productName(productId: number) {
    return products?.find((p) => p.id === productId)?.name ?? `Товар #${productId}`
  }

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500">Нет отзывов на модерации.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="border rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium">{productName(r.product_id)}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < r.rating ? 'text-amber-400' : 'text-gray-200'}
                    fill="currentColor"
                  />
                ))}
                {r.is_verified_purchase && (
                  <span className="text-xs text-emerald-600 ml-2">Проверенная покупка</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => moderate.mutate({ id: r.id, status: 'APPROVED' })}
                disabled={moderate.isPending}
                className="flex items-center gap-1 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check size={16} />
                Одобрить
              </button>
              <button
                onClick={() => moderate.mutate({ id: r.id, status: 'REJECTED' })}
                disabled={moderate.isPending}
                className="flex items-center gap-1 bg-red-50 text-red-600 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
              >
                <X size={16} />
                Отклонить
              </button>
            </div>
          </div>
          {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}
