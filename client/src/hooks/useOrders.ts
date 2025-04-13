import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import type { Order, OrderProduct, DbOrder } from '../types'

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transformOrderForDb = (orderData: Omit<Order, 'id' | 'consecutive'>) => ({
    customer_name: orderData.customerName,
    date: orderData.date,
    total: orderData.total,
    status: orderData.status,
    type: orderData.type
  })

  const addOrder = async (orderData: Omit<Order, 'id' | 'consecutive'>) => {
    try {
      // Insert the order first
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert([transformOrderForDb(orderData)])
        .select()
        .single()

      if (orderError) {
        console.error('Detailed order error:', orderError);
        throw new Error(`Error creating order: ${orderError.message}`);
      }

      // Then insert the order products
      const orderProducts = orderData.products.map(product => ({
        order_id: orderRecord.id,
        product_id: product.id, // Make sure your OrderProduct type includes this
        quantity: product.quantity,
        price: product.price
      }))

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts)

      if (productsError) throw productsError

      // If it's a sale, update product stock
      if (orderData.type === 'sale') {
        for (const product of orderData.products) {
          const { data: currentProduct } = await supabase
            .from('products')
            .select('stock')
            .eq('name', product.name)
            .single()

          if (currentProduct) {
            const newStock = currentProduct.stock - product.quantity
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('name', product.name)

            if (stockError) throw stockError
          }
        }
      }

      await fetchOrders() // Refresh the orders list
      return orderRecord
    } catch (error: any) {
      console.error('Detailed error:', error);
      const message = error.message || error.details || 'Error al crear la orden';
      toast.error(message);
      throw new Error(message);
    }
  }

  const completeOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'completed' } : order
      ))
      return data
    } catch (error: any) {
      console.error('Error completing order:', error)
      throw new Error(error.message || 'Error al completar la orden')
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      // First delete order products
      const { error: productsError } = await supabase
        .from('order_products')
        .delete()
        .eq('order_id', orderId)

      if (productsError) throw productsError

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderError) throw orderError

      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (error: any) {
      console.error('Error deleting order:', error)
      throw new Error(error.message || 'Error al eliminar la orden')
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_products (
            product_id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .order('date', { ascending: false }) // Changed from created_at to date

      if (error) throw error

      const formattedOrders: Order[] = data.map(order => ({
        id: order.id,
        consecutive: order.consecutive,
        date: order.date,
        customerName: order.customer_name,
        total: order.total,
        status: order.status,
        type: order.type,
        products: order.order_products.map((op: any) => ({
          name: op.products.name,
          quantity: op.quantity,
          price: op.price
        }))
      }))

      setOrders(formattedOrders)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Error al cargar órdenes')
      toast.error('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    addOrder,
    completeOrder,
    deleteOrder,
    refreshOrders: fetchOrders
  }
}