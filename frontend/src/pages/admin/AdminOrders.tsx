import { useState } from 'react'
import { useAdminOrders, useAdminUpdateOrderStatus } from '../../hooks/useAdminOrders'
import type { Order } from '../../types/api'

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Создан',
  AWAITING_DELIVERY: 'Ожидает доставки',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['AWAITING_DELIVERY', 'CANCELLED'],
  AWAITING_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders()
  const updateStatus = useAdminUpdateOrderStatus()
  const [error, setError] = useState<string | null>(null)

  async function handleTransition(order: Order, newStatus: string) {
    setError(null)
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: newStatus })
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Не удалось изменить статус')
    }
  }

  if (isLoading) return <p className="text-gray-500">Загрузка заказов...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Все заказы</h1>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="space-y-3">
        {orders?.map((order) => {
          const nextStatuses = VALID_TRANSITIONS[order.status] ?? []
          return (
            <div key={order.id} className="border rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-700">Заказ #{order.id}</span>
                <span className="text-sm px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Пользователь #{order.user_id}</p>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
              <p className="font-bold mt-1">{order.total} сом</p>
              {nextStatuses.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleTransition(order, status)}
                      disabled={updateStatus.isPending}
                      className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      → {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {orders?.length === 0 && <p className="text-gray-500">Заказов пока нет.</p>}
    </div>
  )
}