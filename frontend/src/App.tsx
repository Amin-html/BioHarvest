import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { CatalogPage } from './pages/Catalog'
import { CartPage } from './pages/Cart'
import { CheckoutPage } from './pages/Checkout'
import { OrdersPage } from './pages/Orders'
import { OrderDetailsPage } from './pages/OrderDetails'
import { NotificationsPage } from './pages/Notifications'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<p className="text-gray-500">Страница не найдена.</p>} />
      </Route>
    </Routes>
  )
}