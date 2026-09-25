import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Notification } from '../types/api'

export function useNotifications() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<Notification[]>('/notifications/')).data,
    refetchInterval: 15_000,
    enabled: !!user,
  })
}