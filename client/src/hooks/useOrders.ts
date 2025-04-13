import { useState, useEffect } from 'react';
import axios from 'axios';
import { Order, NewOrder } from '../types';
import { CONFIG } from '../config';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/api/orders`);
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (err) {
      setError('Error fetching orders');
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'consecutive'>) => {
    try {
      const response = await axios.post(`${CONFIG.API_URL}/api/orders`, orderData);
      setOrders(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const completeOrder = async (orderId: string) => {
    const response = await axios.put(`${CONFIG.API_URL}/api/orders/${orderId}/complete`);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? response.data : order
    ));
    return response.data;
  };

  const deleteOrder = async (orderId: string) => {
    await axios.delete(`${CONFIG.API_URL}/api/orders/${orderId}`);
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    addOrder,
    completeOrder,
    deleteOrder,
    refreshOrders: fetchOrders
  };
};