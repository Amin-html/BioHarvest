import { NavLink, Outlet } from 'react-router-dom'

export function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium ${
      isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
    }`

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Админ-панель</h1>
      <div className="flex gap-2 mb-6">
        <NavLink to="/admin/products" className={linkClass}>Товары</NavLink>
        <NavLink to="/admin/categories" className={linkClass}>Категории</NavLink>
        <NavLink to="/admin/orders" className={linkClass}>Заказы</NavLink>
      </div>
      <Outlet />
    </div>
  )
}