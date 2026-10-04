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

export interface ProductImage {
  id: number
  product_id: number
  url: string
  position: number
  is_primary: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  category_id: number
  description: string | null
  is_active: boolean
  images: ProductImage[]
}

export interface ProductListOut {
  items: Product[]
  total: number
  page: number
  page_size: number
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

export interface Stock {
  id: number
  product_id: number
  current_stock: number
  reserved_stock: number
}

export interface WishlistItem {
  id: number
  product_id: number
  product: Product
}

export interface Wishlist {
  items: WishlistItem[]
}

export interface Review {
  id: number
  product_id: number
  user_id: number
  rating: number
  comment: string | null
  is_verified_purchase: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

export interface OrdersByStatus {
  status: string
  count: number
}

export interface RevenuePoint {
  date: string
  revenue: number
}

export interface TopProduct {
  product_id: number
  name: string
  quantity_sold: number
  revenue: number
}

export interface LowStockItem {
  product_id: number
  name: string
  available: number
}

export interface DashboardSummary {
  total_revenue: number
  total_orders: number
  total_customers: number
  orders_by_status: OrdersByStatus[]
  revenue_last_30_days: RevenuePoint[]
  top_products: TopProduct[]
  low_stock: LowStockItem[]
}

export interface ReviewSummary {
  average_rating: number | null
  count: number
  items: Review[]
}