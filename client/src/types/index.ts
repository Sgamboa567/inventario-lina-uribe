export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  alertThreshold: number;
  images: string[];
  usageType: 'venta' | 'sesión 1-a-1' | 'empresarial';
}

export interface Order {
  id: string;
  consecutive: number;
  date: string;
  customerName: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'completed';
  type: 'order' | 'sale';
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