import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { DashboardSummary } from '../types/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get<DashboardSummary>('/admin/dashboard/summary')).data,
  })
}
