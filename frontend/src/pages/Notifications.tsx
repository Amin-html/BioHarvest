import { useNotifications } from '../hooks/useNotifications'

const TYPE_LABELS: Record<string, string> = {
  order_created: 'Заказ создан',
  order_cancelled: 'Заказ отменён',
}

function label(type: string) {
  if (TYPE_LABELS[type]) return TYPE_LABELS[type]
  if (type.startsWith('order_status_')) {
    return `Статус заказа изменён: ${type.replace('order_status_', '')}`
  }
  return type
}

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>
  if (!notifications || notifications.length === 0) return <p className="text-gray-500">Уведомлений нет.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Уведомления</h1>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="border rounded-xl p-3 bg-white flex justify-between items-center">
            <div>
              <p className="font-medium">{label(n.type)}</p>
              <p className="text-sm text-gray-500">
                {'order_id' in n.payload ? `Заказ #${n.payload.order_id}` : ''}
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(n.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}