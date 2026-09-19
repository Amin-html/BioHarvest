import { useParams } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'

export function OrderDetailsPage() {
  const { id } = useParams()
  const { data: orders, isLoading } = useOrders()

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>
  const order = orders?.find((o) => o.id === Number(id))
  if (!order) return <p className="text-gray-500">Заказ не найден.</p>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Заказ #{order.id}</h1>
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-2">
            <span>{item.product_name_snapshot} × {item.quantity}</span>
            <span>{item.line_total} сом</span>
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Подытог: {order.subtotal} сом</p>
        {order.discount_total > 0 && <p>Скидка: -{order.discount_total} сом</p>}
        <p>Доставка: {order.delivery_price} сом</p>
        <p className="font-bold text-black text-base">Итого: {order.total} сом</p>
      </div>
    </div>
  )
}