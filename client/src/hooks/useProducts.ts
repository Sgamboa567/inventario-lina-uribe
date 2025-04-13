import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { Product, DbProduct, mapDbProductToProduct, mapProductToDbProduct } from '../types'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (dbError) throw dbError

      setProducts((data || []).map(mapDbProductToProduct))
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error loading products')
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([mapProductToDbProduct(productData)])
        .select()
        .single()

      if (error) throw error

      const newProduct = mapDbProductToProduct(data)
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(mapProductToDbProduct({ ...products.find(p => p.id === id)!, ...updates }))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedProduct = mapDbProductToProduct(data)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      return updatedProduct
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