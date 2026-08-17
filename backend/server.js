const express = require('express');
const cors = require('cors');
const { initializeDatabase, db } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// 1. GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.queryProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Database error fetching products' });
  }
});

// 2. GET /api/profiles - Get all user profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await db.queryAllProfiles();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Database error fetching profiles' });
  }
});

// 2b. GET /api/profile - Get user profile by query id or default 1
app.get('/api/profile', async (req, res) => {
  const userId = req.query.userId || 1;
  try {
    const user = await db.queryProfile(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Database error fetching profile' });
  }
});

// 2c. POST /api/profile - Create a new user profile
app.post('/api/profile', async (req, res) => {
  const { name, email, address } = req.body;
  if (!name || !email || !address) {
    return res.status(400).json({ error: 'All fields (name, email, address) are required' });
  }
  try {
    const newUser = await db.createProfile(name.trim(), email.trim(), address.trim());
    res.status(201).json({ message: 'Profile created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Database error creating profile' });
  }
});

// 3. PUT /api/profile - Update user profile
app.put('/api/profile', async (req, res) => {
  const { id, name, email, address } = req.body;
  const userId = id || req.query.userId || 1;
  if (!name || !email || !address) {
    return res.status(400).json({ error: 'All fields (name, email, address) are required' });
  }
  try {
    const updatedUser = await db.updateProfile(userId, name.trim(), email.trim(), address.trim());
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Database error updating profile' });
  }
});

// 4. GET /api/cart - Get user's cart items
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await db.queryCart(1);
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Database error fetching cart' });
  }
});

// 5. POST /api/cart/add - Add item to cart
app.post('/api/cart/add', async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }
  try {
    const quantity = parseInt(qty) || 1;
    const cartItem = await db.addToCart(1, productId, quantity);
    res.json({ message: 'Product added to cart successfully', cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Database error adding to cart' });
  }
});

// 6. PUT /api/cart/update - Update quantity of cart item
app.put('/api/cart/update', async (req, res) => {
  const { cartId, qty } = req.body;
  if (!cartId || qty === undefined) {
    return res.status(400).json({ error: 'cartId and qty are required' });
  }
  try {
    const quantity = parseInt(qty);
    if (quantity <= 0) {
      await db.removeFromCart(cartId);
      return res.json({ message: 'Item removed from cart (quantity was 0)' });
    }
    const updatedItem = await db.updateCartQty(cartId, quantity);
    res.json({ message: 'Cart updated successfully', updatedItem });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ error: 'Database error updating cart' });
  }
});

// 7. DELETE /api/cart/remove/:id - Remove item from cart
app.delete('/api/cart/remove/:id', async (req, res) => {
  const cartId = parseInt(req.params.id);
  if (!cartId) {
    return res.status(400).json({ error: 'Valid cartId is required' });
  }
  try {
    const success = await db.removeFromCart(cartId);
    if (success) {
      res.json({ message: 'Item removed from cart successfully' });
    } else {
      res.status(404).json({ error: 'Cart item not found' });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Database error removing from cart' });
  }
});

// 8. POST /api/cart/checkout - Checkout cart
app.post('/api/cart/checkout', async (req, res) => {
  try {
    await db.clearCart(1);
    res.json({ message: 'Checkout successful! Cart cleared.' });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Database error during checkout' });
  }
});

// Start Server and Initialize Database
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();
