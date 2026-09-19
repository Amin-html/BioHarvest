import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart, Bell, User as UserIcon, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { useNotifications } from '../hooks/useNotifications'

export function Layout() {
  const { user, logout } = useAuth()
  const { data: cart } = useCart()
  const { data: notifications } = useNotifications()

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const pendingCount = notifications?.filter((n) => n.status === 'PENDING').length ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-emerald-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
            <Leaf size={22} />
            BioHarvest
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-gray-700">
            <Link to="/catalog" className="hover:text-emerald-600">Каталог</Link>

            {user && (
              <>
                <Link to="/orders" className="hover:text-emerald-600">Заказы</Link>
                <Link to="/notifications" className="relative hover:text-emerald-600">
                  <Bell size={18} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </Link>
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link to="/admin/products" className="hover:text-emerald-600">Админ</Link>
                )}
              </>
            )}

            <Link to="/cart" className="relative hover:text-emerald-600">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <button onClick={() => logout()} className="flex items-center gap-1 text-gray-500 hover:text-red-600">
                <UserIcon size={18} /> Выйти
              </button>
            ) : (
              <Link to="/login" className="text-emerald-600 font-semibold">Войти</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}