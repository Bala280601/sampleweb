import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = 'http://13.233.111.250:30080';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Trigger Toast Notification
  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Fetch Cart Items from Database
  const fetchCart = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Add Product to Database Cart
  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, qty: 1 })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        triggerNotification('Product added to database cart!');
      } else {
        triggerNotification(data.error || 'Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      triggerNotification('Backend database connection error', 'error');
    }
  };

  // Update Item Quantity in Database Cart
  const handleUpdateQty = async (cartId, qty) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, qty })
      });
      if (response.ok) {
        await fetchCart();
        triggerNotification('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      triggerNotification('Failed to update cart in database', 'error');
    }
  };

  // Remove Item from Database Cart
  const handleRemoveItem = async (cartId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/remove/${cartId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchCart();
        triggerNotification('Product removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      triggerNotification('Failed to remove item from database', 'error');
    }
  };

  // Checkout (Clear Database Cart)
  const handleCheckout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/checkout`, {
        method: 'POST'
      });
      if (response.ok) {
        setCartItems([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during checkout:', error);
      triggerNotification('Checkout request failed', 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Compute Total Cart Quantity for Navbar Badge
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Render current active page component
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onAddToCart={handleAddToCart} 
            searchQuery={searchQuery} 
            backendUrl={BACKEND_URL} 
          />
        );
      case 'cart':
        return (
          <Cart 
            cartItems={cartItems} 
            onUpdateQty={handleUpdateQty} 
            onRemoveItem={handleRemoveItem} 
            onCheckout={handleCheckout} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'profile':
        return (
          <Profile 
            backendUrl={BACKEND_URL} 
            triggerNotification={triggerNotification} 
          />
        );
      default:
        return (
          <Home 
            onAddToCart={handleAddToCart} 
            searchQuery={searchQuery} 
            backendUrl={BACKEND_URL} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        cartCount={totalCartCount} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      <main className="content-area">
        {renderPage()}
      </main>

      {/* Floating Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type === 'error' ? 'error' : ''}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
