const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

let pool = null;
let useFallback = false;

// Fallback in-memory database to prevent crash if MySQL connection fails
const fallbackDb = {
  users: [
    { id: 1, name: 'Bala', email: 'bala@gmail.com', address: '123 Main Street, Chennai, TN - 600001' }
  ],
  products: [
    {
      id: 1,
      name: 'Ultra Premium Smartphone',
      price: 15000.00,
      description: 'Sleek 6.7-inch display, 128GB storage, 50MP triple camera, and all-day battery life.',
      category: 'Electronics',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      name: 'Wireless Noise-Cancelling Headphones',
      price: 4500.00,
      description: 'Immersive sound quality, active noise cancellation, and up to 40 hours of continuous playback.',
      category: 'Audio',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'Smart Fitness Smartwatch',
      price: 3200.00,
      description: 'Real-time heart rate tracking, blood oxygen levels monitor, built-in GPS, and premium metal casing.',
      category: 'Wearables',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 4,
      name: 'Ergonomic Mechanical Keyboard',
      price: 2500.00,
      description: 'Tactile blue switches, customizable RGB backlighting, and premium aluminum keycap plate.',
      category: 'Electronics',
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 5,
      name: 'Minimalist Leather Wallet',
      price: 999.00,
      description: 'Handcrafted genuine leather wallet with RFID blocking, slim design, and quick-access card slots.',
      category: 'Accessories',
      image_url: 'https://images.unsplash.com/photo-1627124765135-56c33fc36eab?w=500&auto=format&fit=crop&q=60'
    }
  ],
  cart: [] // Format: { id, user_id, product_id, qty }
};

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL Server to initialize database...');
    // Connect without database first
    const connection = await mysql.createConnection(dbConfig);
    
    // Create DB
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ecommerce_sample'}\`;`);
    await connection.end();
    
    // Connect with database specified
    const poolConfig = {
      ...dbConfig,
      database: process.env.DB_NAME || 'ecommerce_sample',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
    
    pool = mysql.createPool(poolConfig);
    console.log(`Connected to MySQL database: ${poolConfig.database}`);

    // Create tables
    await createTables();
    // Seed tables
    await seedDatabase();

  } catch (error) {
    console.warn('\n⚠️  MYSQL CONNECTION FAILED!');
    console.warn('----------------------------------------------------');
    console.warn(`Error Details: ${error.message}`);
    console.warn('Ensure your MySQL service is running on port 3306 and check root credentials in backend/.env');
    console.warn('⚠️  FALLING BACK TO IN-MEMORY DATABASE FOR DEMO MODE! ⚠️');
    console.warn('----------------------------------------------------\n');
    useFallback = true;
  }
}

async function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      address VARCHAR(255) NOT NULL
    );
  `;

  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      image_url VARCHAR(255)
    );
  `;

  const cartTable = `
    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `;

  await pool.query(usersTable);
  await pool.query(productsTable);
  await pool.query(cartTable);
  console.log('Database tables verified/created successfully.');
}

async function seedDatabase() {
  // Check if users empty
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    await pool.query(
      'INSERT INTO users (name, email, address) VALUES (?, ?, ?)',
      ['Bala', 'bala@gmail.com', '123 Main Street, Chennai, TN - 600001']
    );
    console.log('Seeded Users table.');
  }

  // Check if products empty
  const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
  if (products[0].count === 0) {
    for (const prod of fallbackDb.products) {
      await pool.query(
        'INSERT INTO products (name, price, description, category, image_url) VALUES (?, ?, ?, ?, ?)',
        [prod.name, prod.price, prod.description, prod.category, prod.image_url]
      );
    }
    console.log('Seeded Products table.');
  }
}

// Database helper functions supporting both MySQL and In-Memory fallback
const db = {
  queryProducts: async () => {
    if (useFallback) return fallbackDb.products;
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  },

  queryProfile: async (userId = 1) => {
    if (useFallback) {
      return fallbackDb.users.find(u => u.id === userId) || fallbackDb.users[0];
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  updateProfile: async (userId = 1, name, email, address) => {
    if (useFallback) {
      const idx = fallbackDb.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        fallbackDb.users[idx] = { ...fallbackDb.users[idx], name, email, address };
        return fallbackDb.users[idx];
      }
      return null;
    }
    await pool.query('UPDATE users SET name = ?, email = ?, address = ? WHERE id = ?', [name, email, address, userId]);
    return { id: userId, name, email, address };
  },

  queryCart: async (userId = 1) => {
    if (useFallback) {
      // Return join of cart and products in-memory
      return fallbackDb.cart
        .filter(item => item.user_id === userId)
        .map(item => {
          const product = fallbackDb.products.find(p => p.id === item.product_id);
          return {
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            qty: item.qty,
            name: product ? product.name : 'Unknown Product',
            price: product ? product.price : 0,
            image_url: product ? product.image_url : '',
            category: product ? product.category : ''
          };
        });
    }
    const [rows] = await pool.query(
      `SELECT c.id, c.user_id, c.product_id, c.qty, p.name, p.price, p.image_url, p.category 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  addToCart: async (userId = 1, productId, qty = 1) => {
    if (useFallback) {
      const existing = fallbackDb.cart.find(item => item.user_id === userId && item.product_id === productId);
      if (existing) {
        existing.qty += qty;
        return existing;
      } else {
        const newItem = {
          id: fallbackDb.cart.length ? Math.max(...fallbackDb.cart.map(c => c.id)) + 1 : 1,
          user_id: userId,
          product_id: productId,
          qty
        };
        fallbackDb.cart.push(newItem);
        return newItem;
      }
    }
    
    // Check if product exists in cart
    const [existing] = await pool.query('SELECT id, qty FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) {
      const newQty = existing[0].qty + qty;
      await pool.query('UPDATE cart SET qty = ? WHERE id = ?', [newQty, existing[0].id]);
      return { id: existing[0].id, user_id: userId, product_id: productId, qty: newQty };
    } else {
      const [result] = await pool.query('INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)', [userId, productId, qty]);
      return { id: result.insertId, user_id: userId, product_id: productId, qty };
    }
  },

  updateCartQty: async (cartId, qty) => {
    if (useFallback) {
      const existing = fallbackDb.cart.find(item => item.id === cartId);
      if (existing) {
        existing.qty = qty;
        return existing;
      }
      return null;
    }
    await pool.query('UPDATE cart SET qty = ? WHERE id = ?', [qty, cartId]);
    return { id: cartId, qty };
  },

  removeFromCart: async (cartId) => {
    if (useFallback) {
      const index = fallbackDb.cart.findIndex(item => item.id === cartId);
      if (index !== -1) {
        fallbackDb.cart.splice(index, 1);
        return true;
      }
      return false;
    }
    await pool.query('DELETE FROM cart WHERE id = ?', [cartId]);
    return true;
  },

  clearCart: async (userId = 1) => {
    if (useFallback) {
      fallbackDb.cart = fallbackDb.cart.filter(item => item.user_id !== userId);
      return true;
    }
    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    return true;
  }
};

module.exports = {
  initializeDatabase,
  db
};
