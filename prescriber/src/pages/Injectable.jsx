import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios'; 
import { useCart } from '../context/CartContext';
import { Search, SlidersHorizontal, ShoppingBag, ChevronRight, Package } from 'lucide-react';

const SUB_META = {
  'Toxins':           { desc: 'Botulinum toxin products for muscle relaxation treatments' },
  'HA Fillers':       { desc: 'Hyaluronic acid dermal fillers for volume and contouring' },
  'Skin Boosters':    { desc: 'Hydrating biostimulators for skin quality improvement' },
  'Polynucleotides':  { desc: 'Regenerative PDRN / PN treatments for skin rejuvenation' },
};

const Injectable = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('default');
  
  const subCategoriesList = ['Toxins', 'HA Fillers', 'Skin Boosters', 'Polynucleotides'];
  const [activeSubCategory, setActiveSubCategory] = useState('Toxins');

  const cartContext = useCart();
  const handleQuickAdd = cartContext?.handleQuickAdd 
    ? cartContext.handleQuickAdd 
    : (item) => console.log('Added:', item);

  useEffect(() => {
    const fetchInjectableProducts = async () => {
      setLoading(true);
      try {
        const response = await API.get('/medicines', {
          params: { category: 'Injectables', subCategory: activeSubCategory }
        });
        const data = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
        setProducts(data);
      } catch (error) {
        console.error('Error loading injectable items:', error);
      }
      setLoading(false);
    };
    fetchInjectableProducts();
  }, [activeSubCategory]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (sortKey === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortKey === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortKey === 'az') list.sort((a, b) => a.name?.localeCompare(b.name));
    else if (sortKey === 'za') list.sort((a, b) => b.name?.localeCompare(a.name));
    return list;
  }, [products, searchQuery, sortKey]);

  const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='100%' height='100%' fill='%23f8f8f8'/><text x='50%' y='50%' font-family='sans-serif' font-size='12' fill='%23ccc' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>";

  const getProductImage = (imagePath) => {
    if (!imagePath) return LOCAL_PLACEHOLDER;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
    const apiBase = API.defaults.baseURL || '';
    const serverUrl = apiBase.split('/api')[0];
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${serverUrl}${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* â”€â”€ PAGE HERO â”€â”€ */}
      <div className="bg-black text-white py-10 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={12} />
            <span className="text-white">Injectables</span>
            {activeSubCategory && <><ChevronRight size={12} /><span className="text-gray-300">{activeSubCategory}</span></>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Injectables</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            {SUB_META[activeSubCategory]?.desc || 'Professional-grade aesthetic injectable products.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* â”€â”€ SIDEBAR â”€â”€ */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Categories</p>

              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {subCategoriesList.map((sub) => {
                  const isActive = activeSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => { setActiveSubCategory(sub); setSearchQuery(''); setSortKey('default'); }}
                      className={`group flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 shrink-0 md:shrink whitespace-nowrap md:whitespace-normal w-auto md:w-full
                        ${isActive
                          ? 'bg-black text-white shadow-lg shadow-black/10'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      <span>{sub}</span>
                      <ChevronRight size={13} className={`shrink-0 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Product count card */}
              <div className="hidden md:block mt-6 p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Showing</p>
                <p className="text-2xl font-black text-black mt-0.5">{filteredProducts.length}</p>
                <p className="text-xs text-gray-400 font-medium">products</p>
              </div>
            </div>
          </aside>

          {/* â”€â”€ MAIN CONTENT â”€â”€ */}
          <main className="flex-1 min-w-0">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeSubCategory}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-gray-400 transition-all"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value)}
                  className="pl-10 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black appearance-none cursor-pointer transition-all font-medium"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low â†’ High</option>
                  <option value="price-desc">Price: High â†’ Low</option>
                  <option value="az">Name: A â†’ Z</option>
                  <option value="za">Name: Z â†’ A</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-4 bg-gray-100 rounded" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package size={40} className="text-gray-200 mb-4" />
                <p className="text-base font-semibold text-gray-400">No products found</p>
                <p className="text-sm text-gray-300 mt-1">
                  {searchQuery ? `No results for "${searchQuery}"` : `No products in ${activeSubCategory} yet`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((item) => (
                  <div key={item._id}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">

                    {/* Image */}
                    <div onClick={() => navigate(`/product/${item._id}`)}
                      className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer p-4">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.onerror = null; e.target.src = LOCAL_PLACEHOLDER; }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/4 transition-all duration-300" />
                    </div>

                    {/* Info */}
                    <div className="p-4 border-t border-gray-50">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-1 truncate">
                        {item.brand?.trim() || 'Generic'}
                      </span>
                      <h4 onClick={() => navigate(`/product/${item._id}`)}
                        className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 cursor-pointer hover:text-black min-h-[2.5rem]">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-black text-black">
                          Â£{(item.price || 0).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="flex items-center gap-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-gray-900 active:scale-95 transition-all duration-150">
                          <ShoppingBag size={11} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Injectable;
