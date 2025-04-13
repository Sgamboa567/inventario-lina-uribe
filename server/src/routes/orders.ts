import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderProduct } from '../types';
import { updateProductStock } from '../services/productService';

const router = express.Router();

let orders: Order[] = [];
let orderCounter = 0;

// GET all orders
router.get('/', (req, res) => {
  res.json({ orders });
});

// POST new order
router.post('/', async (req, res) => {
  try {
    orderCounter++;
    const newOrder: Order = {
      id: uuidv4(),
      consecutive: orderCounter,
      date: new Date().toISOString(),
      ...req.body
    };

    // If it's a sale, update stock immediately
    if (newOrder.type === 'sale') {
      for (const product of newOrder.products) {
        await updateProductStock(product.name, -product.quantity);
      }
      newOrder.status = 'completed';
    }

    orders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order/sale:', error);
    res.status(400).json({ error: 'Error creating order/sale' });
  }
});

// PUT complete order
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // Validate that the order is not already completed
    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Order is already completed' });
    }

    // Update product stock for each product in the order
    for (const product of order.products as OrderProduct[]) {
      await updateProductStock(product.name, -product.quantity);
    }

    // Update order status
    orders[orderIndex] = {
      ...order,
      status: 'completed'
    };

    res.json(orders[orderIndex]);
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(400).json({ error: 'Error completing order' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders.splice(orderIndex, 1);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting order' });
  }
});

export default router;