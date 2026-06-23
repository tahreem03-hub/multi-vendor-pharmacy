import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronDown,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  Package,
  FileText,
  Info,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ANNOUNCEMENTS = [
  'Free UK delivery on orders over £99',
  '10% off your first order — use code WELCOME10',
  'Same-day dispatch on orders placed before 2pm',
  'Registered prescribers only · Rx verification required',
];

const AnnouncementBar = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % ANNOUNCEMENTS.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => { setIdx(i => (i - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length); };
  const next = () => { setIdx(i => (i + 1) % ANNOUNCEMENTS.length); };

  return (
    <div className="bg-white border-b border-gray-100 text-gray-700 text-[11px] font-semibold tracking-wide py-2.5 px-4 flex items-center justify-center gap-3 select-none relative">
      <button onClick={prev} className="opacity-30 hover:opacity-70 transition-opacity shrink-0">
        <ChevronLeft size={13} />
      </button>
      <p
        className="text-center transition-all duration-300 px-4"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-4px)' }}
      >
        {ANNOUNCEMENTS[idx]}
      </p>
      <button onClick={next} className="opacity-30 hover:opacity-70 transition-opacity shrink-0">
        <ChevronRight size={13} />
      </button>
      <div className="absolute right-4 hidden sm:flex gap-1.5">
        {ANNOUNCEMENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-gray-800' : 'w-1.5 h-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

const HomeHeader = () => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const navLinks = [
    { key: 'home', to: '/home', icon: <Home size={13} />, label: 'Home' },
    { key: 'products', to: '/trendpro', icon: <Package size={13} />, label: 'Products', hasDropdown: true },
    { key: 'prescription', to: '/prescription-form', icon: <FileText size={13} />, label: 'Prescription' },
    { key: 'howItWorks', to: '/how-it-works', icon: <Sparkles size={13} />, label: 'How It Works' },
    { key: 'about', to: '/about', icon: <Info size={13} />, label: 'About Us' },
    { key: 'contact', to: '/contact', icon: <Mail size={13} />, label: 'Contact' },
  ];

  const navLinkStyle = (key) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.01em',
    color: activeNav === key ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
    background: activeNav === key ? 'rgba(255,255,255,0.08)' : 'transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: 'none',
  });

  return (
    <>
      {/* ─── ANNOUNCEMENT BAR ─── */}
      <AnnouncementBar />

      {/* ─── SEARCH OVERLAY ─── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex flex-col items-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          <button onClick={closeSearch} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
            <X size={28} />
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-6">Search Products</p>
          <div className="w-full max-w-xl relative">
            <div className="flex items-center border-b-2 border-white/30 focus-within:border-white transition-colors pb-2">
              <Search size={20} className="text-white/40 mr-3 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type to search..."
                className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-white/40 hover:text-white ml-2">
                  <X size={18} />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                {searchResults.map(item => (
                  <div
                    key={item._id}
                    onClick={() => {
                      closeSearch();
                      navigate(`/medicine/${item._id}`);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors"
                  >
                    <Search size={13} className="text-white/30 shrink-0" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-white/40 text-xs">£{item.sellingPrice || item.price}</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && !searchLoading && (
              <p className="mt-4 text-sm text-white/30 text-center">No products found for "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <header
        className={`sticky top-0 z-[200] transition-all duration-300 ${isScrolled ? 'shadow-2xl shadow-slate-900/30' : ''
          }`}
        style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2a45 100%)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)'}`,
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 32px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}>

            {/* ─── Logo ─── */}
            <Link
              to="/home"
              onClick={() => setActiveNav('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(15,118,110,0.3)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="10" y="3" width="4" height="18" rx="2" fill="rgba(255,255,255,0.95)" />
                  <rect x="3" y="10" width="18" height="4" rx="2" fill="rgba(255,255,255,0.95)" />
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    DrG
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    Pharma
                  </span>
                </div>
                <div style={{
                  marginTop: '1px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(15,118,110,0.15)',
                  border: '1px solid rgba(15,118,110,0.2)',
                  borderRadius: '20px',
                  padding: '1px 8px',
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0F766E' }} />
                  <span style={{ fontSize: '6.5px', fontWeight: '700', color: '#0F766E', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Aesthetic Pharmacy
                  </span>
                </div>
              </div>
            </Link>

            {/* ─── Navigation (center) ─── */}
            <nav style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '2px',
  flex: 1,
  justifyContent: 'center',
}}>
  {navLinks.map((link) => {
    if (link.hasDropdown) {
      return (
        <div
          key={link.key}
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowProductsMenu(true)}
          onMouseLeave={() => setShowProductsMenu(false)}
        >
          <Link
            to={link.to}
            onClick={() => {
              setActiveNav(link.key);
              if (window.innerWidth < 768) {
                setShowProductsMenu(!showProductsMenu);
              }
            }}
            style={navLinkStyle(link.key)}
          >
            {link.icon} {link.label}
            <ChevronDown
              size={12}
              style={{
                transform: showProductsMenu ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease',
                opacity: showProductsMenu ? 1 : 0.4,
              }}
            />
          </Link>

          {showProductsMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                background: '#FFFFFF',
                borderRadius: '12px',
                minWidth: '210px',
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
                  onClick={() => {
                    handleCategoryClick(cat);
                    setShowProductsMenu(false);
                  }}
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
      );
    }
    return (
      <Link
        key={link.key}
        to={link.to}
        onClick={() => setActiveNav(link.key)}
        style={navLinkStyle(link.key)}
      >
        {link.icon} {link.label}
      </Link>
    );
  })}
</nav>

            {/* ─── Right Actions ─── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
            }}>
              {/* Search Icon */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="hover:bg-white/10 hover:text-white"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Auth Buttons */}
              {isLoggedIn ? (
                <>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    <User size={13} /> {user?.name?.split(' ')[0] || 'User'}
                  </span>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/10 hover:text-white"
                  >
                    <LogOut size={16} />
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
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/10 hover:text-white"
                  >
                    <LogIn size={13} /> Login
                  </Link>

                  <Link
                    to="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      background: 'rgba(15, 118, 110, 0.12)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    }}
                    className="hover:bg-teal-500/20 hover:border-teal-400/50 hover:shadow-[0_8px_32px_rgba(15,118,110,0.2)]"
                  >
                    <UserPlus size={13} /> Register
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
                className="hover:bg-white/10 hover:border-white/15"
              >
                <div style={{ position: 'relative' }}>
                  <ShoppingCart size={17} color="#fff" strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#0F766E',
                        color: '#fff',
                        fontSize: '8px',
                        fontWeight: '800',
                        borderRadius: '50%',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        border: '2px solid #1a2a45',
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

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="md:hidden hover:bg-white/10 hover:text-white"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* ─── Mobile Menu ─── */}
          {mobileMenuOpen && (
            <div style={{
              padding: '16px 32px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(15,26,46,0.98)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }} className="md:hidden">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div key={link.key}>
                      <button
                        type="button"
                        onClick={() => setShowProductsMenu(!showProductsMenu)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                        }}
                        className="hover:bg-white/5 hover:text-white"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {link.icon} {link.label}
                        </span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: showProductsMenu ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </button>
                      {showProductsMenu && (
                        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {productCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                handleCategoryClick(cat);
                                setMobileMenuOpen(false);
                                setShowProductsMenu(false);
                              }}
                              style={{
                                padding: '10px 16px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                              }}
                              className="hover:bg-white/5 hover:text-white"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.key}
                    to={link.to}
                    onClick={() => {
                      setActiveNav(link.key);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: activeNav === link.key ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                      background: activeNav === link.key ? 'rgba(255,255,255,0.06)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/5 hover:text-white"
                  >
                    {link.icon} {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default HomeHeader;