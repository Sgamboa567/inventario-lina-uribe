import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import type { Order, OrderProduct } from '../types'

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
        products: order.order_products.map(op => ({
          name: op.products.name,
          quantity: op.quantity,
          price: op.price
        }))
      }))

      setOrders(formattedOrders)
      setError(null)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Error fetching orders')
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
    error
  }
}