import type { Database } from '../lib/database.types'

export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbOrder = Database['public']['Tables']['orders']['Row']
export type DbOrderProduct = Database['public']['Tables']['order_products']['Row']

export type OrderType = 'order' | 'sale'
export type OrderStatus = 'pending' | 'completed'

export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  stock: number
  alertThreshold: number
  images: string[]
  usageType: 'venta' | 'sesión 1-a-1' | 'empresarial'
}

export interface OrderProduct {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  consecutive: number
  date: string
  customerName: string
  products: OrderProduct[]
  total: number
  status: OrderStatus
  type: OrderType
}

export interface NewOrder {
  customerName: string
  products: OrderProduct[]
  total: number
  status: OrderStatus
  type: OrderType
}

export const mapDbProductToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  category: dbProduct.category,
  price: dbProduct.price,
  stock: dbProduct.stock,
  alertThreshold: dbProduct.alert_threshold,
  images: dbProduct.images,
  usageType: dbProduct.usage_type
})

export const mapProductToDbProduct = (product: Omit<Product, 'id'>): Omit<DbProduct, 'id' | 'created_at'> => ({
  name: product.name,
  description: product.description,
  category: product.category,
  price: product.price,
  stock: product.stock,
  alert_threshold: product.alertThreshold,
  images: product.images,
  usage_type: product.usageType
})

export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TOAST_DURATION: 3000,
  IMAGE_UPLOAD_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
  DEFAULT_CURRENCY: 'COP',
  DEFAULT_LOCALE: 'es-CO',
  STOCK_WARNING_THRESHOLD: 5,
};

export const CURRENCY_FORMAT = new Intl.NumberFormat(CONFIG.DEFAULT_LOCALE, {
  style: 'currency',
  currency: CONFIG.DEFAULT_CURRENCY,
  minimumFractionDigits: 0
});

export const DATE_FORMAT = new Intl.DateTimeFormat(CONFIG.DEFAULT_LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});