import React from 'react';
import { ShoppingBag, ShoppingCart, User, Search, Sparkles } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage, cartCount, searchQuery, setSearchQuery }) {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <a 
          href="#home" 
          className="nav-brand"
          onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}
        >
          <Sparkles size={24} className="glow-icon" />
          <span>E-Shop Premium</span>
        </a>

        {currentPage === 'home' && (
          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <nav className="nav-menu">
          <a
            href="#home"
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </a>

          <a
            href="#profile"
            className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('profile'); }}
          >
            <User size={18} />
            <span>Profile</span>
          </a>

          <a
            href="#cart"
            className={`nav-link cart-icon-badge ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('cart'); }}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </a>
        </nav>
      </div>
    </header>
  );
}
