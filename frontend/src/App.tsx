import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/AdminNav'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { CatalogPage } from './pages/Catalog'
import { CartPage } from './pages/Cart'
import { CheckoutPage } from './pages/Checkout'
import { OrdersPage } from './pages/Orders'
import { OrderDetailsPage } from './pages/OrderDetails'
import { NotificationsPage } from './pages/Notifications'
import { AdminProductsPage } from './pages/admin/AdminProducts'
import { AdminCategoriesPage } from './pages/admin/AdminCategories'

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

        <Route element={<ProtectedRoute roles={['ADMIN', 'STAFF']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<p className="text-gray-500">Страница не найдена.</p>} />
      </Route>
    </Routes>
  )
}