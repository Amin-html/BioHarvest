import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Notification } from '../types/api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<Notification[]>('/notifications/')).data,
    refetchInterval: 15_000, // простой поллинг раз в 15с, без вебсокетов
  })
}