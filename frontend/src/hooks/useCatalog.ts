import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Product, Category, ProductListOut } from '../types/api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products/')).data,
  })
}

export interface ProductSearchParams {
  q?: string
  category_id?: number
  min_price?: number
  max_price?: number
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest'
  page: number
  page_size?: number
}

export function useProductSearch(params: ProductSearchParams) {
  return useQuery({
    queryKey: ['products-search', params],
    queryFn: async () => {
      const search = new URLSearchParams()
      if (params.q) search.set('q', params.q)
      if (params.category_id) search.set('category_id', String(params.category_id))
      if (params.min_price != null) search.set('min_price', String(params.min_price))
      if (params.max_price != null) search.set('max_price', String(params.max_price))
      if (params.sort) search.set('sort', params.sort)
      search.set('page', String(params.page))
      search.set('page_size', String(params.page_size ?? 20))
      return (await api.get<ProductListOut>(`/products/search?${search.toString()}`)).data
    },
    placeholderData: (prev) => prev,
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get<Product>(`/products/${slug}`)).data,
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories/')).data,
  })
}