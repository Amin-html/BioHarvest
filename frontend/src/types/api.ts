export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN'

export interface User {
  id: number
  email: string
  role: UserRole
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  category_id: number
  is_active: boolean
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
}

export interface Cart {
  id: number
  items: CartItem[]
}

export interface OrderItem {
  id: number
  product_id: number
  product_name_snapshot: string
  unit_price_snapshot: number
  quantity: number
  line_total: number
}

export interface Order {
  id: number
  user_id: number  
  status: 'CREATED' | 'AWAITING_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  total: number
  delivery_method_id: number | null
  delivery_price: number
  created_at: string
  items: OrderItem[]
  promo_code_id: number | null
  discount_total: number
}

export interface DeliveryMethod {
  id: number
  zone_id: number
  type: string
  price: number
  eta_days: number
}

export interface Notification {
  id: number
  type: string
  payload: Record<string, unknown>
  status: string
  created_at: string
}