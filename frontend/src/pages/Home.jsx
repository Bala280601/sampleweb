import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Home({ onAddToCart, searchQuery, backendUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      
      // Extract categories dynamically
      const uniqueCategories = ['All', ...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure the Node.js server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <section className="hero-banner glass-panel">
        <h1>Experience Premium Shopping</h1>
        <p>Explore our curated collections designed to fit your lifestyle. Direct integration between React, Express, and MySQL database.</p>
      </section>

      {/* Categories Tabs */}
      {!loading && !error && (
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
          <span>Loading products from database...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Backend Connection Error</h3>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              <h3>No products found matching your criteria.</h3>
              <p style={{ marginTop: '0.5rem' }}>Try modifying your search or select a different category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card glass-panel">
                  <div className="product-image-wrapper">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="product-image" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span className="product-badge">{product.category}</span>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-price-row">
                      <span className="product-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                      <button 
                        className="btn btn-primary"
                        onClick={() => onAddToCart(product.id)}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Simple Inline Keyframe styles for spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
