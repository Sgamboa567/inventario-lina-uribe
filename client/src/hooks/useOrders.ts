import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import type { Order, OrderProduct, DbOrder } from '../types'

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_products (
            id,
            product_id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .order('date', { ascending: false })

      if (ordersError) throw ordersError

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
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Error loading orders')
      toast.error('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const addOrder = async (orderData: Omit<Order, 'id' | 'consecutive'>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          total: orderData.total,
          status: orderData.status,
          type: orderData.type,
          date: orderData.date
        }])
        .select()
        .single()

      if (error) throw error

      // Add order products
      const orderProducts = orderData.products.map(product => ({
        order_id: data.id,
        quantity: product.quantity,
        price: product.price
      }))

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts)

      if (productsError) throw productsError

      await fetchOrders() // Refresh orders to get complete data
      return data
    } catch (error) {
      console.error('Error adding order:', error)
      throw error
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
    } catch (error) {
      console.error('Error completing order:', error)
      throw error
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
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