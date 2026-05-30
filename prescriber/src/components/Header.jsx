import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
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
    <header className="bg-slate-900 text-white  font-sans">
      {/* Top Bar Layout: Added flex-wrap for mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-1 shrink-0 select-none">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Doctor<span className="text-indigo-400">G</span>
          </span>
        </Link>

        {/* Center Search Input Field: Added w-full and responsive order */}
        <div className="flex-1 w-full md:max-w-xl relative order-3 md:order-2">
          <div className="relative flex items-center border  rounded-md px-3 py-2">
            <Search size={18} className="text-neutral-200 mr-2 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-gray-500 outline-none placeholder-neutral-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-neutral-400 hover:text-white ml-2"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {isSearchOpen && filteredResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-neutral-900 border  rounded-md shadow-xl overflow-hidden z-[300]">
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

        {/* Right Section: Cart */}
        <Link to="/cart" className="flex items-center gap-2 bg-white text-black px-3 py-2 sm:px-4 rounded-sm hover:bg-neutral-200 transition-colors shrink-0 order-2 md:order-3">
          <ShoppingCart size={16} strokeWidth={2.5} />
          <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase">
            Cart ({cartCount})
          </span>
        </Link>
      </div>

      {/* Sub-Navigation Strip: Added flex-wrap for smaller screens */}
      <div className="border-t border-neutral-900 bg-slate-900">
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