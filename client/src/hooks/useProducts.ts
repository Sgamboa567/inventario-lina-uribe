import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Product = Database['public']['Tables']['products']['Row']

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error fetching products')
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error

      setProducts(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProducts(prev => 
        prev.map(product => product.id === id ? data : product)
      )
      return data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  }
}