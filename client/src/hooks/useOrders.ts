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

  const checkStock = async (products: OrderProduct[]) => {
    for (const product of products) {
      const { data: productData } = await supabase
        .from('products')
        .select('stock')
        .eq('name', product.name)
        .single();

      if (!productData) {
        throw new Error(`Producto no encontrado: ${product.name}`);
      }

      if (productData.stock < product.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${productData.stock}`);
      }
    }
  };

  const updateStock = async (products: OrderProduct[]) => {
    for (const product of products) {
      // First get the product ID
      const { data: productData } = await supabase
        .from('products')
        .select('id, stock')
        .eq('name', product.name)
        .single();

      if (!productData) {
        throw new Error(`Producto no encontrado: ${product.name}`);
      }

      // Then update the stock using our custom function
      const { error: stockError } = await supabase
        .rpc('update_product_stock', {
          product_id: productData.id,
          quantity: product.quantity
        });

      if (stockError) {
        throw new Error(`Error actualizando stock de ${product.name}: ${stockError.message}`);
      }
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'consecutive'>) => {
    try {
      // For sales, check stock before creating
      if (orderData.type === 'sale') {
        await checkStock(orderData.products);
      }

      // Insert the order
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          date: orderData.date,
          total: orderData.total,
          status: orderData.status,
          type: orderData.type
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Insert order products
      const orderProducts = orderData.products.map(product => ({
        order_id: orderRecord.id,
        product_name: product.name,
        quantity: product.quantity,
        price: product.price
      }))

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts)

      if (productsError) throw productsError

      // If it's a sale, update stock immediately
      if (orderData.type === 'sale') {
        await updateStock(orderData.products)
      }

      await fetchOrders()
      return orderRecord
    } catch (error: any) {
      console.error('Detailed error:', error)
      throw new Error(error.message || 'Error al crear la orden')
    }
  }

  const completeOrder = async (orderId: string) => {
    try {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          order_products (
            quantity,
            product_name
          )
        `)
        .eq('id', orderId)
        .single()

      if (!order) throw new Error('Orden no encontrada')

      // Check stock before completing
      const products = order.order_products.map((op: any) => ({
        name: op.product_name,
        quantity: op.quantity
      }))

      // Validate stock
      await checkStock(products)

      // Update stock
      await updateStock(products)

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)

      if (error) throw error

      await fetchOrders()
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
              id,
              name
            )
          )
        `)
        .order('date', { ascending: false })

      if (error) throw error

      const formattedOrders: Order[] = data.map(order => ({
        id: order.id,
        consecutive: order.consecutive,
        date: order.date,
        customerName: order.customer_name,
        total: order.total,
        status: order.status,
        type: order.type,
        products: order.order_products
          .filter((op: any) => op.products) // Filter out any null products
          .map((op: any) => ({
            name: op.products?.name || 'Producto no encontrado',
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