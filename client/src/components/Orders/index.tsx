import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import type { Order, Product, OrderProduct } from '../../types';
import { toast } from 'react-toastify';

const Orders: React.FC = () => {
  const { products } = useProducts();
  const { orders, addOrder, completeOrder, deleteOrder } = useOrders();
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderType, setOrderType] = useState<'order' | 'sale'>('order');
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    products: [] as OrderProduct[],
    total: 0,
    status: 'pending' as const,
    type: 'order' as const
  });

  const handleAddProduct = (productName: string, quantity: number) => {
    const product = products.find(p => p.name === productName);
    if (!product) return;

    if (orderType === 'sale' && quantity > product.stock) {
      toast.error(`Stock insuficiente. Stock actual: ${product.stock}. Por favor, cree una orden.`);
      return;
    }

    const existingProduct = selectedProducts.find(p => p.name === productName);
    if (existingProduct) {
      const updatedProducts = selectedProducts.map(p => 
        p.name === productName 
          ? { ...p, quantity: p.quantity + quantity }
          : p
      );
      setSelectedProducts(updatedProducts);
      updateOrderTotal(updatedProducts);
    } else {
      const newProducts = [...selectedProducts, { 
        name: productName, 
        quantity, 
        price: product.price 
      }];
      setSelectedProducts(newProducts);
      updateOrderTotal(newProducts);
    }
  };

  const updateOrderTotal = (products: OrderProduct[]) => {
    try {
      // Check if products array is valid
      if (!Array.isArray(products) || products.length === 0) {
        setNewOrder(prev => ({
          ...prev,
          products: [],
          total: 0,
          type: orderType
        }));
        return;
      }
  
      // Validate and format each product
      const validatedProducts = products.map(p => {
        if (!p.name || typeof p.quantity !== 'number' || typeof p.price !== 'number') {
          throw new Error(`Invalid product data: ${JSON.stringify(p)}`);
        }
        return {
          name: p.name,
          quantity: Math.max(1, Math.floor(p.quantity)),
          price: Math.max(0, p.price)
        };
      });
  
      // Calculate total
      const total = validatedProducts.reduce((sum, p) => 
        sum + (p.price * p.quantity), 0);
  
      // Update order state
      setNewOrder(prev => ({
        ...prev,
        products: validatedProducts,
        total,
        type: orderType
      }));
  
    } catch (error) {
      console.error('Error updating order total:', error);
      toast.error('Error al actualizar el total de la orden');
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validación adicional
      if (selectedProducts.length === 0) {
        toast.error('Debe agregar al menos un producto');
        return;
      }
  
      const orderData = {
        ...newOrder,
        products: selectedProducts,
        date: new Date().toISOString(),
        type: orderType,
        status: orderType === 'sale' ? 'completed' : 'pending'
      };
  
      await addOrder(orderData);
      toast.success(`${orderType === 'sale' ? 'Venta' : 'Orden'} creada exitosamente`);
      setShowAddModal(false);
      // Reset form
      setSelectedProducts([]);
      setNewOrder({
        customerName: '',
        products: [],
        total: 0,
        status: 'pending',
        type: 'order'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder(orderId);
      toast.success('Orden completada exitosamente');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Error al completar la orden');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar esta ${order.type === 'sale' ? 'venta' : 'orden'}?`)) {
      try {
        await deleteOrder(order.id);
        toast.success(`${order.type === 'sale' ? 'Venta' : 'Orden'} eliminada exitosamente`);
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error(`Error al eliminar la ${order.type === 'sale' ? 'venta' : 'orden'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-12 text-center">
          Ventas y Solicitudes
        </h1>

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button 
            onClick={() => {
              setOrderType('order');
              setShowAddModal(true);
            }}
            className="btn-primary font-medium"
          >
            + Nueva Orden
          </button>
          <button 
            onClick={() => {
              setOrderType('sale');
              setShowAddModal(true);
            }}
            className="btn-primary font-medium bg-green-600 hover:bg-green-700"
          >
            + Nueva Venta
          </button>
        </div>

        {/* Add Order/Sale Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-6">
                {orderType === 'sale' ? 'Nueva Venta' : 'Nueva Orden'}
              </h2>
              
              <form onSubmit={handleAddOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={newOrder.customerName}
                    onChange={e => setNewOrder({...newOrder, customerName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productos
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      value=""
                      onChange={(e) => {
                        const product = products.find(p => p.name === e.target.value);
                        if (product) {
                          handleAddProduct(e.target.value, 1);
                        }
                      }}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option 
                          key={product.id} 
                          value={product.name}
                          disabled={orderType === 'sale' && product.stock === 0}
                        >
                          {product.name} - ${product.price.toLocaleString()} 
                          {orderType === 'sale' && ` (Stock: ${product.stock})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 space-y-2">
                    {selectedProducts.map(product => (
                      <div key={product.name} className="flex justify-between items-center p-2 bg-pink-50 rounded-md">
                        <span>{product.name}</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              const productData = products.find(p => p.name === product.name);
                              if (productData && orderType === 'sale' && newQuantity > productData.stock) {
                                toast.error(`Stock insuficiente. Stock actual: ${productData.stock}`);
                                return;
                              }
                              const updatedProducts = selectedProducts.map(p =>
                                p.name === product.name
                                  ? { ...p, quantity: newQuantity }
                                  : p
                              );
                              setSelectedProducts(updatedProducts);
                              updateOrderTotal(updatedProducts);
                            }}
                            className="w-20 p-1 border border-gray-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedProducts = selectedProducts.filter(p => p.name !== product.name);
                              setSelectedProducts(updatedProducts);
                              updateOrderTotal(updatedProducts);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-2xl font-medium text-brand-pink">
                    ${newOrder.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedProducts([]);
                      setNewOrder({
                        customerName: '',
                        products: [],
                        total: 0,
                        status: 'pending',
                        type: 'order'
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {orderType === 'sale' ? 'Guardar Venta' : 'Guardar Orden'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card">
            <span className="text-3xl font-bold text-brand-pink mb-2">
              {orders.length}
            </span>
            <span className="text-gray-600">Pedidos Totales</span>
          </div>
          <div className="stat-card">
            <span className="text-3xl font-bold text-brand-pink mb-2">
              {orders.filter(o => o.status === 'pending').length}
            </span>
            <span className="text-gray-600">Pendientes</span>
          </div>
          <div className="stat-card">
            <span className="text-3xl font-bold text-brand-pink mb-2">
              {orders.filter(o => o.status === 'completed').length}
            </span>
            <span className="text-gray-600">Completados</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">
                    {order.type === 'sale' ? 'Venta' : 'Orden'} #{String(order.consecutive).padStart(3, '0')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.customerName}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </span>
                  <div className="flex space-x-2">
                    {order.status === 'pending' && order.type === 'order' && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Completar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
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

              <div className="flex flex-wrap gap-2 mb-4">
                {order.products.map((product: OrderProduct) => (
                  <span key={product.name} className="bg-pink-50 text-brand-pink px-3 py-1 rounded-full text-sm">
                    {product.name} (x{product.quantity})
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xl font-medium text-brand-pink">
                  ${order.total.toLocaleString()}
                </span>
                <button 
                  onClick={() => setShowDetailsModal(order.id)}
                  className="btn-primary"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-6">
                Detalles de la Orden
              </h2>
              {orders.find(o => o.id === showDetailsModal) && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Cliente</h3>
                    <p className="text-gray-900">{orders.find(o => o.id === showDetailsModal)?.customerName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Productos</h3>
                    <ul className="mt-2 space-y-2">
                      {orders.find(o => o.id === showDetailsModal)?.products.map((product: OrderProduct) => (
                        <li key={product.name} className="bg-pink-50 p-2 rounded-md">
                          {product.name} (x{product.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Total</h3>
                    <p className="text-2xl font-medium text-brand-pink">
                      ${orders.find(o => o.id === showDetailsModal)?.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowDetailsModal(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;