import { Product } from '../types';
import { products } from '../routes/products';

export const updateProductStock = async (productName: string, quantity: number): Promise<void> => {
  const productIndex = products.findIndex((p: Product) => p.name === productName);
  
  if (productIndex === -1) {
    throw new Error(`Product ${productName} not found`);
  }

  const updatedStock = products[productIndex].stock + quantity;
  if (updatedStock < 0) {
    throw new Error(`Insufficient stock for product ${productName}`);
  }

  products[productIndex].stock = updatedStock;
};