import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Cart } from '../types/api'

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<Cart>('/cart/')).data,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { product_id: number; quantity?: number }) =>
      (await api.post<Cart>('/cart/items/', { quantity: 1, ...vars })).data,
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { itemId: number; quantity: number }) =>
      (await api.patch<Cart>(`/cart/items/${vars.itemId}`, { quantity: vars.quantity })).data,
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: number) =>
      (await api.delete<Cart>(`/cart/items/${itemId}`)).data,
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  })
}