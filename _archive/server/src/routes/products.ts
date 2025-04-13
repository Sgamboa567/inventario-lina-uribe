import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types';

const router = express.Router();

// Make products array exportable with initial data
export let products: Product[] = [
  {
    id: uuidv4(),
    name: 'Set de Maquillaje Profesional',
    description: 'Set completo de maquillaje para profesionales',
    category: 'Maquillaje',
    price: 240000,
    stock: 2,
    alertThreshold: 2,
    images: [],
    usageType: 'venta'
  }
];

// GET all products
router.get('/', (req, res) => {
  try {
    // Add sorting by name
    const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
    res.json({ products: sortedProducts });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error getting products' });
  }
});

// POST new product with enhanced validation
router.post('/', (req, res) => {
  try {
    const { name, description, category, price, stock, alertThreshold, usageType } = req.body;
    
    // Enhanced validations
    if (!name?.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    if (!category?.trim()) {
      return res.status(400).json({ error: 'La categoría es requerida' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'El stock debe ser un número positivo' });
    }
    
    if (typeof alertThreshold !== 'number' || alertThreshold < 0) {
      return res.status(400).json({ error: 'El umbral de alerta debe ser un número positivo' });
    }

    if (!['venta', 'sesión 1-a-1', 'empresarial'].includes(usageType)) {
      return res.status(400).json({ error: 'Tipo de uso inválido' });
    }

    const newProduct: Product = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() || '',
      category: category.trim(),
      price: Math.round(price * 100) / 100, // Round to 2 decimals
      stock: Math.floor(stock), // Ensure whole numbers for stock
      alertThreshold: Math.floor(alertThreshold),
      images: req.body.images || [],
      usageType
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: 'Error creating product' });
  }
});

// PUT update product with stock validation
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateIndex = products.findIndex(p => p.id === id);
    
    if (updateIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const currentProduct = products[updateIndex];
    const updates = req.body;

    // Validate stock changes
    if (typeof updates.stock === 'number' && updates.stock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo' });
    }

    // Validate price changes
    if (typeof updates.price === 'number' && updates.price < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo' });
    }

    // Update product with validation
    products[updateIndex] = {
      ...currentProduct,
      ...updates,
      id, // Ensure ID doesn't change
      stock: typeof updates.stock === 'number' ? Math.floor(updates.stock) : currentProduct.stock,
      price: typeof updates.price === 'number' ? Math.round(updates.price * 100) / 100 : currentProduct.price
    };

    res.json(products[updateIndex]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: 'Error updating product' });
  }
});

// DELETE product with usage validation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Add product to deletion history if needed
    // await addToProductHistory(products[productIndex]);

    products.splice(productIndex, 1);
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ error: 'Error eliminando producto' });
  }
});

export default router;