import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Product, Category } from '../types/api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products/')).data,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories/')).data,
  })
}