import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Address } from '../types/api'

export function useAddresses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get<Address[]>('/addresses/')).data,
    enabled: !!user,
  })
}

export interface AddressInput {
  label?: string
  full_address: string
  city?: string
  phone?: string
  is_default?: boolean
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: AddressInput) => (await api.post<Address>('/addresses/', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AddressInput> }) =>
      (await api.patch<Address>(`/addresses/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })
}
