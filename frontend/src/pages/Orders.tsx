import { Link } from 'react-router-dom'
import { useOrders, useCancelOrder } from '../hooks/useOrders'

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Создан',
  AWAITING_DELIVERY: 'Ожидает доставки',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const cancelOrder = useCancelOrder()

  if (isLoading) return <p className="text-gray-500">Загрузка заказов...</p>
  if (!orders || orders.length === 0) return <p className="text-gray-500">У вас пока нет заказов.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Мои заказы</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <Link to={`/orders/${order.id}`} className="font-semibold text-emerald-700">
                Заказ #{order.id}
              </Link>
              <span className="text-sm px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
            <p className="font-bold mt-1">{order.total} сом</p>
            {(order.status === 'CREATED' || order.status === 'AWAITING_DELIVERY') && (
              <button
                onClick={() => cancelOrder.mutate(order.id)}
                className="mt-2 text-red-500 text-sm hover:text-red-700"
              >
                Отменить заказ
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}