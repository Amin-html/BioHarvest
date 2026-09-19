export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN'

export interface User {
  id: number
  email: string
  role: UserRole
}

export interface LoginResponse {
  access_token: string
  token_type: string
}