import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { Product } from '../types'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transformProductForDb = (product: Omit<Product, 'id'>) => ({
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    alert_threshold: product.alertThreshold,
    images: product.images || [],
    usage_type: product.usageType
  })

  const transformDbProduct = (dbProduct: any): Product => ({
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    category: dbProduct.category,
    price: dbProduct.price,
    stock: dbProduct.stock,
    alertThreshold: dbProduct.alert_threshold,
    images: dbProduct.images || [],
    usageType: dbProduct.usage_type
  })

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const transformedData = transformProductForDb(productData)
      
      const { data, error } = await supabase
        .from('products')
        .insert([transformedData])
        .select()
        .single()

      if (error) throw error

      const newProduct = transformDbProduct(data)
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (error: any) {
      console.error('Error adding product:', error)
      throw new Error(error.message || 'Error al agregar producto')
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const transformedUpdates = transformProductForDb(updates as Omit<Product, 'id'>)
      
      const { data, error } = await supabase
        .from('products')
        .update(transformedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedProduct = transformDbProduct(data)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      return updatedProduct
    } catch (error: any) {
      console.error('Error updating product:', error)
      throw new Error(error.message || 'Error al actualizar producto')
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error

      setProducts((data || []).map(transformDbProduct))
      setError(null)
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Error al cargar productos')
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      console.error('Error deleting product:', error)
      throw new Error(error.message || 'Error al eliminar producto')
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