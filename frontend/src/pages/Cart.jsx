import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, ShoppingBag, Sparkles, CheckCircle } from 'lucide-react';

export default function Cart({ cartItems, onUpdateQty, onRemoveItem, onCheckout, setCurrentPage }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  };

  const handleCheckoutClick = async () => {
    setCheckingOut(true);
    // Simulate checkout step
    setTimeout(async () => {
      const success = await onCheckout();
      setCheckingOut(false);
      if (success) {
        setCheckoutSuccess(true);
      }
    }, 1500);
  };

  if (checkoutSuccess) {
    return (
      <div className="glass-panel empty-cart-state" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <CheckCircle size={64} style={{ color: 'var(--accent-emerald)', animation: 'popScale 0.5s ease-out' }} />
        <h2>Order Placed Successfully!</h2>
        <p style={{ maxWidth: '400px' }}>Your simulated payment went through. The checkout API POST /cart/checkout was successfully hit, and the database cart table has been cleared.</p>
        <button className="btn btn-primary" onClick={() => { setCheckoutSuccess(false); setCurrentPage('home'); }}>
          <ShoppingBag size={18} /> Continue Shopping
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="glass-panel empty-cart-state">
        <ShoppingCart size={64} className="empty-cart-icon" />
        <h2>Your Cart is Empty</h2>
        <p>You haven't added any products to your cart yet. Go to the products list to find premium deals.</p>
        <button className="btn btn-primary" onClick={() => setCurrentPage('home')}>
          <ShoppingBag size={18} /> View Products
        </button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const delivery = subtotal > 5000 ? 'Free' : '₹150';
  const deliveryCost = subtotal > 5000 ? 0 : 150;
  const total = subtotal + deliveryCost;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Your Shopping Cart</h2>
      
      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-container">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item glass-panel">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <div className="cart-item-details">
                <span className="cart-item-category">{item.category}</span>
                <h3 className="cart-item-title">{item.name}</h3>
                <span className="cart-item-price">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
              </div>

              {/* Quantity Selector */}
              <div className="cart-qty-controls">
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQty(item.id, item.qty - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-number">{item.qty}</span>
                <button 
                  className="qty-btn"
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Remove button */}
              <button 
                className="btn btn-danger" 
                style={{ padding: '0.6rem' }} 
                onClick={() => onRemoveItem(item.id)}
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Panel */}
        <div className="cart-summary-panel glass-panel">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row">
            <span>Total Items:</span>
            <span>{calculateTotalItems()}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Shipping:</span>
            <span>{delivery}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span className="total-price">₹{total.toLocaleString('en-IN')}</span>
          </div>
          
          <button 
            className="btn btn-primary checkout-btn" 
            onClick={handleCheckoutClick}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <>Processing...</>
            ) : (
              <>
                <Sparkles size={16} /> Proceed to Checkout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
