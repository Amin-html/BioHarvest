import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/api'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <Outlet />
}