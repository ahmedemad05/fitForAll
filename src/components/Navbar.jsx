import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Unified Navbar — replaces the old per-variant approach.
 * - Responsive: desktop links + hamburger mobile drawer
 * - Auth-aware: shows Login/Register when logged out, Profile/Dashboard when in
 * - Role-aware: admin gets "Admin" badge and link to /admin
 * - Theme toggle built in
 * - Mobile drawer: closes on Escape, outside click, and route change
 * - Focus trap omitted (drawer is not a modal dialog) but Escape works
 */
export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  const isLanding = location.pathname === '/' || location.pathname === '/index.html';

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    logout();
  };

  const scrollTo = (hash) => {
    if (isLanding) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // ─── Link sets ────────────────────────────────────────────────────────────
  const publicLinks = (
    <>
      {isLanding && (
        <>
          <a
            href="#features"
            onClick={(e) => { e.preventDefault(); scrollTo('#features'); setMenuOpen(false); }}
          >
            What We Offer
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => { e.preventDefault(); scrollTo('#how-it-works'); setMenuOpen(false); }}
          >
            How It Works
          </a>
        </>
      )}
      {!isLanding && <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>}
      <Link to="/coaches" className={isActive('/coaches') ? 'active' : ''}>Coaches</Link>
      <Link to="/login">Log In</Link>
      <Link to="/register" className="nav-btn">Register</Link>
    </>
  );

  const userLinks = (
    <>
      {!isLanding && <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>}
      <Link to="/coaches" className={isActive('/coaches') ? 'active' : ''}>Coaches</Link>
      <Link to="/food-guide" className={isActive('/food-guide') ? 'active' : ''}>Food Guide</Link>
      <Link to="/gym-coach" className={isActive('/gym-coach') ? 'active' : ''}>Food Scanner</Link>
      <Link to="/product-scanner" className={isActive('/product-scanner') ? 'active' : ''}>Product Scanner</Link>
      <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
        {user?.name ? user.name.split(' ')[0] : 'Profile'}
      </Link>
      <a href="#logout" className="nav-btn" onClick={handleLogout}>Log Out</a>
    </>
  );

  const adminLinks = (
    <>
      <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
      <Link to="/coaches" className={isActive('/coaches') ? 'active' : ''}>Coaches</Link>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          background: 'var(--primary)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '20px',
          letterSpacing: '0.5px',
        }}
      >
        ADMIN
      </span>
      <a href="#logout" className="nav-btn" onClick={handleLogout}>Log Out</a>
    </>
  );

  const activeLinks = isLoggedIn ? (isAdmin ? adminLinks : userLinks) : publicLinks;

  return (
    <>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <Link to="/" className="navbar-logo" aria-label="FIT FOR ALL – home">
          FIT FOR ALL
        </Link>

        {/* Desktop links */}
        <div className="nav-links" role="list">
          {activeLinks}
        </div>

        {/* Right side: theme toggle + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="nav-theme-toggle"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            ref={hamburgerRef}
            className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`nav-mobile-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        className={`nav-mobile-drawer ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="Mobile navigation"
      >
        {activeLinks}

        {/* Theme toggle in drawer */}
        <button
          className="nav-theme-toggle"
          onClick={() => { toggleTheme(); setMenuOpen(false); }}
          aria-pressed={theme === 'dark'}
          style={{ marginTop: '8px', alignSelf: 'flex-start' }}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </>
  );
}
