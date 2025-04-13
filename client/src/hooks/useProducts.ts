import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product } from '../types';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products');
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/products`, productData);
      setProducts(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData);
      setProducts(prev => 
        prev.map(product => product.id === id ? response.data : product)
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};