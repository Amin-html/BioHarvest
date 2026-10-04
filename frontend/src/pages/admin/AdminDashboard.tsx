import { useDashboard } from '../../hooks/useDashboard'
import { TrendingUp, Package, Users, AlertTriangle } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Создан',
  AWAITING_DELIVERY: 'Ожидает доставки',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

export function AdminDashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>
  if (!data) return <p className="text-gray-500">Нет данных.</p>

  const maxRevenue = Math.max(1, ...data.revenue_last_30_days.map((p) => p.revenue))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={<TrendingUp size={20} />} label="Выручка" value={`${data.total_revenue} сом`} />
        <SummaryCard icon={<Package size={20} />} label="Заказов" value={String(data.total_orders)} />
        <SummaryCard icon={<Users size={20} />} label="Покупателей" value={String(data.total_customers)} />
      </div>

      <div className="border rounded-xl p-4 bg-white">
        <h2 className="font-semibold text-emerald-700 mb-3">Выручка за 30 дней</h2>
        {data.revenue_last_30_days.length === 0 ? (
          <p className="text-sm text-gray-400">Пока нет данных.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {data.revenue_last_30_days.map((p) => (
              <div
                key={p.date}
                className="flex-1 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors"
                style={{ height: `${Math.max(4, (p.revenue / maxRevenue) * 100)}%` }}
                title={`${p.date}: ${p.revenue} сом`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <h2 className="font-semibold text-emerald-700 mb-3">Заказы по статусам</h2>
          <div className="space-y-2">
            {data.orders_by_status.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <h2 className="font-semibold text-emerald-700 mb-3">Топ товаров</h2>
          {data.top_products.length === 0 ? (
            <p className="text-sm text-gray-400">Пока нет продаж.</p>
          ) : (
            <div className="space-y-2">
              {data.top_products.map((p) => (
                <div key={p.product_id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{p.name} × {p.quantity_sold}</span>
                  <span className="font-medium">{p.revenue} сом</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.low_stock.length > 0 && (
        <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
          <h2 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            Низкий остаток
          </h2>
          <div className="space-y-1">
            {data.low_stock.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-amber-700">{item.available} шт</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border rounded-xl p-4 bg-white flex items-center gap-3">
      <div className="text-emerald-600 bg-emerald-50 rounded-lg p-2">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
