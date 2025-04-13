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

export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
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