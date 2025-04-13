import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Area, AreaChart
} from 'recharts';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types';

// Colores para el dashboard
const COLORS = {
  normal: '#98FB98',
  low: '#FFB6C1',
  out: '#FFE4E1',
  sales: '#4CAF50',
  orders: '#FF9800',
  warning: '#f44336'
};

const Dashboard: React.FC = () => {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();

  // Loading state
  if (productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-pink border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (productsError || ordersError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow">
          Error: {productsError || ordersError}
        </div>
      </div>
    );
  }

  // Cálculos financieros y estadísticos
  const totalInventoryValue = products.reduce((sum, product) => 
    sum + (product.price * product.stock), 0);

  const completedOrders = orders.filter(order => order.status === 'completed');
  const completedTotal = completedOrders.reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const pendingTotal = pendingOrders.reduce((sum, order) => sum + order.total, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.alertThreshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Nuevos cálculos para análisis
  const sales = orders.filter(order => order.type === 'sale');
  const regularOrders = orders.filter(order => order.type === 'order');
  
  const salesByMonth = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(0, month).toLocaleString('es-ES', { month: 'short' }),
    ventas: sales.filter(s => new Date(s.date).getMonth() === month).reduce((sum, s) => sum + s.total, 0),
    ordenes: regularOrders.filter(o => new Date(o.date).getMonth() === month).reduce((sum, o) => sum + o.total, 0)
  }));

  const topProducts = [...products]
    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 5);

  // Cálculos financieros más precisos
  const calculateFinancials = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    return {
      monthlyTotal: monthlyOrders.reduce((sum, order) => sum + order.total, 0),
      monthlyCount: monthlyOrders.length,
      pendingValue: pendingOrders.reduce((sum, order) => sum + order.total, 0),
      inventoryValue: products.reduce((sum, product) => 
        sum + (product.price * product.stock), 0),
      lowStockValue: lowStockProducts.reduce((sum, product) => 
        sum + (product.price * product.stock), 0)
    };
  };

  const financials = calculateFinancials();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
          Panel de Control
        </h1>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card bg-gradient-to-br from-rose-200 to-rose-300">
            <h3 className="text-lg font-medium text-gray-700">Inventario Total</h3>
            <p className="text-3xl font-bold">${totalInventoryValue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{products.length} productos</p>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-green-100 to-green-200">
            <h3 className="text-lg font-medium text-gray-700">Ventas Totales</h3>
            <p className="text-3xl font-bold">${completedTotal.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{completedOrders.length} completadas</p>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-amber-100 to-amber-200">
            <h3 className="text-lg font-medium text-gray-700">Órdenes Pendientes</h3>
            <p className="text-3xl font-bold">${pendingTotal.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{pendingOrders.length} en proceso</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-100 to-blue-200">
            <h3 className="text-lg font-medium text-gray-700">Productos Críticos</h3>
            <p className="text-3xl font-bold">{lowStockProducts.length}</p>
            <p className="text-sm text-gray-600">{outOfStockProducts.length} sin stock</p>
          </div>
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Ventas vs Órdenes Mensuales */}
          <div className="card bg-white p-6">
            <h3 className="text-xl font-medium mb-4">Ventas vs Órdenes Mensuales</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="ventas" stroke={COLORS.sales} fill={COLORS.sales} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="ordenes" stroke={COLORS.orders} fill={COLORS.orders} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución de Stock */}
          <div className="card bg-white p-6">
            <h3 className="text-xl font-medium mb-4">Estado del Inventario</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Stock Normal', value: products.length - lowStockProducts.length },
                      { name: 'Stock Bajo', value: lowStockProducts.length - outOfStockProducts.length },
                      { name: 'Sin Stock', value: outOfStockProducts.length }
                    ]}
                    dataKey="value"  // Add this line
                    nameKey="name"   // Add this line
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    <Cell fill={COLORS.normal} />
                    <Cell fill={COLORS.low} />
                    <Cell fill={COLORS.out} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alertas de Stock y Top Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Alertas de Stock Bajo */}
          <div className="card bg-white">
            <h3 className="text-xl font-medium mb-4">Alertas de Stock</h3>
            <div className="space-y-2 max-h-80 overflow-auto">
              {lowStockProducts.map(product => (
                <div 
                  key={product.id}
                  className={`p-3 rounded-lg ${
                    product.stock === 0 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">Stock: {product.stock} / Mínimo: {product.alertThreshold}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock === 0 ? 'Sin Stock' : 'Stock Bajo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Productos por Valor */}
          <div className="card bg-white">
            <h3 className="text-xl font-medium mb-4">Top Productos por Valor</h3>
            <div className="space-y-2">
              {topProducts.map(product => (
                <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>
                    <p className="font-medium text-brand-pink">
                      ${(product.price * product.stock).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Órdenes Pendientes */}
        <div className="card bg-white">
          <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-6">
            Órdenes Pendientes
          </h2>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-4 bg-pink-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {order.type === 'sale' ? 'Venta' : 'Orden'} #{String(order.consecutive).padStart(3, '0')}
                    </h3>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-brand-pink">
                      ${order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.products.map((product, index) => (
                    <span key={index} className="text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                      {product.name} (x{product.quantity})
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay órdenes pendientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;