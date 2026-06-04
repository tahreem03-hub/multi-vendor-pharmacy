import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeftSearchVisible, setIsLeftSearchVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const leftSearchRef = useRef(null);
  const navigate = useNavigate();
  
  const { cartCount } = useCart();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await API.get("/medicines");
        const data = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
        setProducts(data);
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (isLeftSearchVisible && leftSearchRef.current) leftSearchRef.current.focus();
  }, [isLeftSearchVisible]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResults([]);
    } else {
      const results = products.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setFilteredResults(results);
    }
  }, [searchQuery, products]);

  const handleResultClick = (id) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    navigate(`/product/${id}`); 
  };

  return (
    <header className="bg-black text-white font-sans">
      {/* Top Bar Layout: Added flex-wrap for mobile */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-1 shrink-0 select-none">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Doctor<span className="text-gray-300">G</span>
          </span>
        </Link>


        {/* Inline search container (appears on click, to the right of the logo) */}
        <div className="order-2 w-full md:w-1/3 lg:w-1/4 mx-2">
          {isLeftSearchVisible && (
            <div className="relative">
              <div className="bg-neutral-900 border rounded-md px-3 py-2 flex items-center">
                <Search size={18} className="text-neutral-200 mr-2 shrink-0" />
                <input
                  ref={leftSearchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm text-gray-500 outline-none placeholder-neutral-200"
                />
                <button onClick={() => setIsLeftSearchVisible(false)} className="text-neutral-400 hover:text-white ml-2">
                  <X size={16} />
                </button>
              </div>

              {isSearchOpen && filteredResults.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-neutral-900 border rounded-md shadow-xl overflow-hidden z-[300]">
                  {filteredResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleResultClick(item._id)}
                      className="p-3 text-sm text-neutral-300 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 last:border-none transition-colors"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Search Toggle + Cart */}
        <div className="flex items-center shrink-0 order-3">
          <button
            onClick={() => setIsLeftSearchVisible(v => !v)}
            aria-label="Toggle search"
            className="text-white p-2 rounded-md hover:bg-neutral-800 mr-2"
          >
            <Search size={18} />
          </button>

          <Link to="/cart" className="flex items-center gap-2 bg-white text-black px-3 py-2 sm:px-4 rounded-sm hover:bg-neutral-200 transition-colors">
            <ShoppingCart size={16} strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase">
              Cart ({cartCount})
            </span>
          </Link>
        </div>
      </div>

      

      

      {/* Sub-Navigation Strip: Added flex-wrap for smaller screens */}
      <div className="border-t border-neutral-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[14px] sm:text-sm font-bold tracking-wider text-white">
          <Link to="/Skincare" className="hover:text-slate-300 transition-colors hover:underline">Skincare</Link>
          <Link to="/injectables" className="hover:text-slate-300 transition-colors hover:underline">Injectables</Link>
          <Link to="/about" className="hover:text-slate-300 transition-colors hover:underline">AboutUs</Link>
          <Link to="/Contact" className="hover:text-slate-300 transition-colors hover:underline">Contact</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;