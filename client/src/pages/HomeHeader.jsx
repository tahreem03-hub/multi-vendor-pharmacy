import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronDown,
  ShoppingCart,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  Pill,
  Home,
  Package,
  FileText,
  Info,
  Mail,
  Menu,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const HomeHeader = () => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const { cart, cartCount } = useCart();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    setShowResults(true);

    try {
      const res = await API.get('/medicines');
      const all = Array.isArray(res.data)
        ? res.data
        : res.data?.medicines || [];

      const q = query.toLowerCase();

      const filtered = all
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        )
        .slice(0, 5);
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const productCategories = [
    'Botulinum Toxins',
    'Dermal Fillers',
    'Skin Boosters',
    'Fat Dissolvers',
    'Consumables',
  ];

  const handleCategoryClick = (cat) => {
    setActiveNav('products');
    setShowProductsMenu(false);
    navigate('/trendpro', { state: { category: cat } });
  };

  const navLinkStyle = (key) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 20px',
    height: '100%',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.01em',
    color: activeNav === key ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
    borderBottom: activeNav === key ? '2.5px solid #0F766E' : '2.5px solid transparent',
    transition: 'all 0.25s ease',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    position: 'relative',
  });

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-2xl shadow-slate-900/20' : ''
      }`}
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      {/* ─── Top Bar ─── */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2a45 100%)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)'}`,
      }}>
        <div style={{
          maxWidth: '1440px', 
          margin: '0 auto', 
          padding: '0 40px',
          height: '76px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '32px',
        }}>

          {/* ─── Logo ─── */}
          <Link
            to="/home"
            onClick={() => setActiveNav('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'relative',
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(15,118,110,0.3)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="10" y="3" width="4" height="18" rx="2" fill="rgba(255,255,255,0.95)"/>
                  <rect x="3" y="10" width="18" height="4" rx="2" fill="rgba(255,255,255,0.95)"/>
                </svg>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  DrG
                </span>
                <span style={{ fontSize: '20px', fontWeight: '300', color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  Pharma
                </span>
              </div>
              <div style={{
                marginTop: '2px',
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(15,118,110,0.15)',
                border: '1px solid rgba(15,118,110,0.2)',
                borderRadius: '20px',
                padding: '1px 8px',
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0F766E' }} />
                <span style={{ fontSize: '7px', fontWeight: '700', color: '#0F766E', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Aesthetic Pharmacy
                </span>
              </div>
            </div>
          </Link>

          {/* ─── Search Bar ─── */}
          <div
            ref={searchRef}
            style={{
              flex: 1,
              maxWidth: '560px',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) {
                    setShowResults(true);
                  }
                }}
                placeholder="Search products, brands, categories..."
                style={{
                  width: '100%',
                  padding: '10px 44px 10px 18px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '40px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                className="focus:border-teal-400 focus:bg-white/10"
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    padding: '4px',
                    borderRadius: '50%',
                  }}
                >
                  <X size={15} />
                </button>
              ) : (
                <Search
                  size={17}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    color: 'rgba(255,255,255,0.25)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {showResults && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  zIndex: 200,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
              >
                {searchLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div
                      style={{
                        padding: '10px 18px 8px',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#f8fafc',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {searchResults.length} results found
                      </span>
                    </div>

                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setShowResults(false);
                          navigate(`/medicine/${product._id}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 18px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        className="hover:bg-teal-50"
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            flexShrink: 0,
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {product.image ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${product.image}`}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Pill size={16} color="#0F766E" />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#0f1a2e',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                            {product.category} {product.brand ? `· ${product.brand}` : ''}
                          </p>
                        </div>

                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f1a2e', flexShrink: 0 }}>
                          £{product.sellingPrice || product.price}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                    No results for "<span style={{ color: '#0f1a2e', fontWeight: '600' }}>{searchQuery}</span>"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Right Actions ─── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {isLoggedIn ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '30px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover:bg-white/10"
                    >
                      <User size={13} /> Admin
                    </Link>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '30px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      <User size={13} /> {user?.name || 'User'}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: '30px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/10 hover:text-white"
                  >
                    <LogOut size={13} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '30px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/10"
                  >
                    <LogIn size={13} /> Login
                  </Link>

                  <Link
                    to="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '30px',
                      background: 'rgba(15,118,110,0.2)',
                      border: '1px solid rgba(15,118,110,0.25)',
                      color: '#0F766E',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-teal-500/20 hover:border-teal-400"
                  >
                    <UserPlus size={13} /> Register
                  </Link>
                </>
              )}
            </div>

            {/* ─── Cart ─── */}
            <Link
              to="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 20px',
                borderRadius: '40px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              className="hover:bg-white/10 hover:border-white/15"
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={18} color="#fff" strokeWidth={1.8} />

                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-9px',
                      right: '-9px',
                      background: '#0F766E',
                      color: '#fff',
                      fontSize: '8px',
                      fontWeight: '800',
                      borderRadius: '50%',
                      minWidth: '17px',
                      height: '17px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: '2px solid #0f1a2e',
                    }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.01em',
                }}
              >
                Cart
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Navigation Row ─── */}
      <div style={{ 
        background: 'rgba(15, 26, 46, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            height: '48px',
            gap: '2px',
          }}
        >
          <Link to="/home" onClick={() => setActiveNav('home')} style={navLinkStyle('home')}>
            <Home size={13} /> Home
          </Link>

          <div
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setShowProductsMenu(true)}
            onMouseLeave={() => setShowProductsMenu(false)}
          >
            <button
              type="button"
              onClick={() => handleCategoryClick()}
              style={{ 
                ...navLinkStyle('products'), 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Package size={13} /> Products
              <ChevronDown
                size={12}
                style={{
                  transform: showProductsMenu ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                  marginLeft: '2px',
                  opacity: showProductsMenu ? 1 : 0.4,
                }}
              />
            </button>

            {showProductsMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 2px)',
                  left: 0,
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  minWidth: '220px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  zIndex: 1000,
                  boxShadow: '0 16px 50px rgba(0,0,0,0.12)',
                }}
              >
                <div style={{ padding: '10px 18px 8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Categories
                  </span>
                </div>
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1e293b',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:bg-teal-50 hover:text-slate-900"
                  >
                    <div style={{ 
                      width: '5px', 
                      height: '5px', 
                      borderRadius: '50%', 
                      background: '#0F766E',
                      flexShrink: 0,
                    }} />
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/prescription-form" onClick={() => setActiveNav('prescription')} style={navLinkStyle('prescription')}>
            <FileText size={13} /> Prescription
          </Link>

          <Link to="/how-it-works" onClick={() => setActiveNav('howItWorks')} style={navLinkStyle('howItWorks')}>
            <Sparkles size={13} /> How It Works
          </Link>

          <Link to="/about" onClick={() => setActiveNav('about')} style={navLinkStyle('about')}>
            <Info size={13} /> About Us
          </Link>

          <Link to="/contact" onClick={() => setActiveNav('contact')} style={navLinkStyle('contact')}>
            <Mail size={13} /> Contact
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;