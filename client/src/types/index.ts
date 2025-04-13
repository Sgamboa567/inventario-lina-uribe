import type { Database } from '../lib/database.types'

export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbOrder = Database['public']['Tables']['orders']['Row']
export type DbOrderProduct = Database['public']['Tables']['order_products']['Row']

export type OrderType = 'order' | 'sale';
export type OrderStatus = 'pending' | 'completed';

export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface Order extends Omit<DbOrder, 'customer_name' | 'created_at'> {
  customerName: string;
  products: OrderProduct[];
}

export interface NewOrder {
  customerName: string;
  products: OrderProduct[];
  total: number;
  status: OrderStatus;
  type: OrderType;
}

export interface Product extends Omit<DbProduct, 'alert_threshold' | 'usage_type' | 'created_at'> {
  alertThreshold: number;
  usageType: 'venta' | 'sesión 1-a-1' | 'empresarial';
}

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