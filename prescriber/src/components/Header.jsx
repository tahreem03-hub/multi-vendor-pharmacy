import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, X, Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';

const NAV_LINKS = [
  { to: '/Skincare',    label: 'Skincare' },
  { to: '/injectables', label: 'Injectables' },
  { to: '/about',       label: 'About Us' },
  { to: '/contact',     label: 'Contact' },
];

const Header = () => {
  const [searchOpen, setSearchOpen]       = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [products, setProducts]           = useState([]);
  const [filteredResults, setFiltered]    = useState([]);
  const searchInputRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const { cartCount } = useCart();

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* fetch products for search */
  useEffect(() => {
    API.get('/medicines')
      .then(res => setProducts(Array.isArray(res.data) ? res.data : (res.data.medicines || [])))
      .catch(() => {});
  }, []);

  /* focus input when overlay opens */
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  /* filter */
  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered([]); return; }
    setFiltered(products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 7));
  }, [searchQuery, products]);

  const handleResultClick = (id) => {
    setSearchQuery(''); setFiltered([]); setSearchOpen(false);
    navigate(`/product/${id}`);
  };

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); setFiltered([]); };

  return (
    <>
      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex flex-col items-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
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
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setFiltered([]); }} className="text-white/40 hover:text-white ml-2">
                  <X size={18} />
                </button>
              )}
            </div>
            {filteredResults.length > 0 && (
              <div className="mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                {filteredResults.map(item => (
                  <div key={item._id} onClick={() => handleResultClick(item._id)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors">
                    <Search size={13} className="text-white/30 shrink-0" />
                    {item.name}
                  </div>
                ))}
              </div>
            )}
            {searchQuery && filteredResults.length === 0 && (
              <p className="mt-4 text-sm text-white/30 text-center">No products found for "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

      <header className="bg-black text-white font-sans sticky top-0 z-[200]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="shrink-0 select-none">
            <span className="text-xl font-black tracking-tight text-white">
              Doctor<span className="text-gray-400">G</span>
            </span>
          </Link>

          {/* Centre nav — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors rounded-lg
                  ${location.pathname === to
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search icon */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Search size={18} />
            </button>

            {/* Cart icon — plain, no button style */}
            <Link to="/cart" aria-label="Cart" className="relative w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile */}
            <button onClick={() => setMobileOpen(v => !v)} aria-label="Menu"
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;