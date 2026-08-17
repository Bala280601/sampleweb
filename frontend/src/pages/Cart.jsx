import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, ShoppingBag, Sparkles, CheckCircle, Download, Printer, FileText, ArrowLeft } from 'lucide-react';

export default function Cart({ cartItems, onUpdateQty, onRemoveItem, onCheckout, setCurrentPage, activeProfile }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  };

  const handleCheckoutClick = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);

    const subtotal = calculateSubtotal();
    const deliveryCost = subtotal > 5000 ? 0 : 150;
    const total = subtotal + deliveryCost;

    // Snapshot order details before clearing cart in database
    const snapshotReceipt = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      customer: {
        name: activeProfile?.name || 'Valued Customer',
        email: activeProfile?.email || 'customer@example.com',
        address: activeProfile?.address || 'Standard Delivery Address'
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: parseFloat(item.price),
        qty: item.qty,
        itemTotal: parseFloat(item.price) * item.qty
      })),
      subtotal,
      deliveryCost,
      total,
      paymentMethod: 'Instant Online Payment (Simulated)',
      paymentStatus: 'PAID / VERIFIED'
    };

    setTimeout(async () => {
      const success = await onCheckout();
      setCheckingOut(false);
      if (success) {
        setReceiptData(snapshotReceipt);
        setCheckoutSuccess(true);
      }
    }, 1200);
  };

  // Download Receipt as Text file
  const handleDownloadTextReceipt = () => {
    if (!receiptData) return;

    let receiptContent = `======================================================\n`;
    receiptContent += `             E-SHOP PREMIUM - ORDER RECEIPT           \n`;
    receiptContent += `======================================================\n\n`;
    receiptContent += `Invoice Number : ${receiptData.invoiceNumber}\n`;
    receiptContent += `Order Reference: ${receiptData.orderId}\n`;
    receiptContent += `Date & Time    : ${receiptData.orderDate}\n`;
    receiptContent += `Payment Status : ${receiptData.paymentStatus}\n`;
    receiptContent += `Payment Method : ${receiptData.paymentMethod}\n\n`;
    receiptContent += `------------------------------------------------------\n`;
    receiptContent += `CUSTOMER INFORMATION\n`;
    receiptContent += `------------------------------------------------------\n`;
    receiptContent += `Name    : ${receiptData.customer.name}\n`;
    receiptContent += `Email   : ${receiptData.customer.email}\n`;
    receiptContent += `Address : ${receiptData.customer.address}\n\n`;
    receiptContent += `------------------------------------------------------\n`;
    receiptContent += `ORDER ITEMS\n`;
    receiptContent += `------------------------------------------------------\n`;
    receiptData.items.forEach((item, index) => {
      receiptContent += `${index + 1}. ${item.name} (${item.category})\n`;
      receiptContent += `   Qty: ${item.qty} x ₹${item.price.toLocaleString('en-IN')} = ₹${item.itemTotal.toLocaleString('en-IN')}\n`;
    });
    receiptContent += `\n------------------------------------------------------\n`;
    receiptContent += `FINANCIAL SUMMARY\n`;
    receiptContent += `------------------------------------------------------\n`;
    receiptContent += `Subtotal         : ₹${receiptData.subtotal.toLocaleString('en-IN')}\n`;
    receiptContent += `Shipping Fee     : ${receiptData.deliveryCost === 0 ? 'FREE' : `₹${receiptData.deliveryCost}`}\n`;
    receiptContent += `Grand Total Paid : ₹${receiptData.total.toLocaleString('en-IN')}\n`;
    receiptContent += `======================================================\n`;
    receiptContent += `          Thank you for shopping with us!            \n`;
    receiptContent += `======================================================\n`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Receipt-${receiptData.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print Receipt (clean print stylesheet)
  const handlePrintReceipt = () => {
    window.print();
  };

  if (checkoutSuccess && receiptData) {
    return (
      <div className="receipt-page-container">
        {/* Top Success Banner */}
        <div className="receipt-success-badge no-print">
          <CheckCircle size={32} className="success-icon-glow" />
          <div>
            <h3>Payment Received & Order Confirmed!</h3>
            <p>Your receipt has been generated below. You can download or print it for your records.</p>
          </div>
        </div>

        {/* Printable Official Invoice Receipt Card */}
        <div className="receipt-card glass-panel" id="printable-receipt">
          <div className="receipt-header">
            <div>
              <span className="receipt-badge">Official Tax Invoice</span>
              <h1 className="receipt-brand-title">E-Shop Premium</h1>
              <p className="receipt-sub">Verified E-Commerce Payment Receipt</p>
            </div>
            <div className="receipt-meta">
              <div><strong>Invoice No:</strong> {receiptData.invoiceNumber}</div>
              <div><strong>Order ID:</strong> {receiptData.orderId}</div>
              <div><strong>Date:</strong> {receiptData.orderDate}</div>
              <div className="receipt-status-pill">
                <CheckCircle size={14} /> PAID
              </div>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Customer / Billing Info */}
          <div className="receipt-customer-grid">
            <div className="customer-info-box">
              <span className="info-box-label">Billed & Shipped To</span>
              <div className="customer-name">{receiptData.customer.name}</div>
              <div className="customer-detail">{receiptData.customer.email}</div>
              <div className="customer-detail address">{receiptData.customer.address}</div>
            </div>
            <div className="payment-info-box">
              <span className="info-box-label">Payment Information</span>
              <div className="customer-detail"><strong>Status:</strong> {receiptData.paymentStatus}</div>
              <div className="customer-detail"><strong>Method:</strong> {receiptData.paymentMethod}</div>
              <div className="customer-detail"><strong>Transaction:</strong> TXN-{receiptData.orderId}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className="receipt-item-name">{item.name}</div>
                    <div className="receipt-item-category">{item.category}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.itemTotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="receipt-summary-box">
            <div className="receipt-summary-row">
              <span>Subtotal</span>
              <span>₹{receiptData.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="receipt-summary-row">
              <span>Shipping & Delivery</span>
              <span>{receiptData.deliveryCost === 0 ? 'FREE' : `₹${receiptData.deliveryCost}`}</span>
            </div>
            <div className="receipt-summary-row grand-total">
              <span>Total Paid</span>
              <span className="grand-total-amount">₹{receiptData.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="receipt-footer-note">
            <p>Thank you for your purchase! This is a system generated receipt and requires no physical signature.</p>
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="receipt-actions no-print">
          <button className="btn btn-secondary" onClick={() => { setCheckoutSuccess(false); setCurrentPage('home'); }}>
            <ArrowLeft size={18} /> Continue Shopping
          </button>
          
          <button className="btn btn-secondary" onClick={handleDownloadTextReceipt}>
            <FileText size={18} /> Download Receipt (.txt)
          </button>

          <button className="btn btn-primary" onClick={handlePrintReceipt}>
            <Printer size={18} /> Print / Save as PDF
          </button>
        </div>
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
            <span>Customer:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeProfile?.name || 'Bala'}</span>
          </div>
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
              <>Processing Payment...</>
            ) : (
              <>
                <Sparkles size={16} /> Pay & Download Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
