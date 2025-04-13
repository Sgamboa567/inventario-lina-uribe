import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types';
import { toast } from 'react-toastify';

const Products: React.FC = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    alertThreshold: 0,
    images: [],
    usageType: 'venta'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!newProduct.name?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if ((newProduct.price ?? 0) < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }
    
    if ((newProduct.stock ?? 0) < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }
  
    if ((newProduct.alertThreshold ?? 0) < 0) {
      toast.error('El umbral de alerta no puede ser negativo');
      return;
    }
  
    if ((newProduct.alertThreshold ?? 0) > (newProduct.stock ?? 0)) {
      toast.warning('El umbral de alerta es mayor que el stock actual');
    }

    console.log('Submitting product:', newProduct);

    try {
      console.log('Validated product data:', {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        alertThreshold: Number(newProduct.alertThreshold)
      });

      if (selectedProduct) {
        // Actualizar producto existente
        await updateProduct(selectedProduct.id, newProduct);
        toast.success('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await addProduct(newProduct as Omit<Product, 'id'>);
        toast.success('Producto agregado exitosamente');
      }
      setShowAddModal(false);
      setSelectedProduct(null);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        alertThreshold: 0,
        images: [],
        usageType: 'venta'
      });
    } catch (err) {
      console.error('Detailed error:', err);
      toast.error(selectedProduct ? 'Error al actualizar producto' : 'Error al agregar producto');
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        toast.success('Producto eliminado exitosamente');
      } catch (err) {
        console.error('Error deleting product:', err);
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const handleStockAdjustment = async (product: Product, adjustment: number) => {
    try {
      const newStock = product.stock + adjustment;
      if (newStock < 0) {
        toast.error('El stock no puede ser negativo');
        return;
      }
      await updateProduct(product.id, { ...product, stock: newStock });
      toast.success(`Stock ${adjustment > 0 ? 'aumentado' : 'disminuido'} exitosamente`);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      toast.error('Error al ajustar el stock');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-pink border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-12 text-center">
          Catálogo de Productos
        </h1>

        {/* Add Product Button */}
        <div className="mb-8">
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setShowAddModal(true);
            }}
            className="btn-primary font-medium"
          >
            + Agregar Producto
          </button>
        </div>

        {/* Products Grid - Simplified version */}
        <div className="grid grid-cols-1 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600">Categoría: {product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium text-brand-pink">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleStockAdjustment(product, -1)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <p className={`font-medium ${
                      product.stock <= product.alertThreshold 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      Stock: {product.stock}
                    </p>
                    <p className="text-sm text-gray-500">Mínimo: {product.alertThreshold}</p>
                  </div>

                  <button
                    onClick={() => handleStockAdjustment(product, 1)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1 text-sm text-brand-pink hover:bg-pink-50 rounded-md"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-6">
                {selectedProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newProduct.description || ''}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={newProduct.alertThreshold}
                      onChange={e => setNewProduct({...newProduct, alertThreshold: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Uso
                  </label>
                  <select
                    value={newProduct.usageType}
                    onChange={e => setNewProduct({...newProduct, usageType: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="venta">Venta</option>
                    <option value="sesión 1-a-1">Sesión 1-a-1</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {selectedProduct ? 'Guardar Cambios' : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;