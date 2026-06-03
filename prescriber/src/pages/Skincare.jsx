import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';

const Skincare = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const subCategoriesList = ['Hair', 'Skincare', 'Make Up'];
  const [activeSubCategory, setActiveSubCategory] = useState('Skincare');

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await API.get('/medicines');
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data.medicines || []);
        setAllProducts(data);
      } catch (error) {
        console.error('Error loading skincare items:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const products = allProducts.filter(p => {
    const matchCategory = p.category?.toLowerCase() === 'skincare';
    const matchSub = !activeSubCategory ||
      p.subCategory?.toLowerCase() === activeSubCategory.toLowerCase();
    return matchCategory && matchSub;
  });

  const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>";

  const getProductImage = (imagePath) => {
    if (!imagePath) return LOCAL_PLACEHOLDER;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${imagePath.replace(/\\/g, '/')}` ;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 bg-white font-sans text-left">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-10">

        {/* Sidebar / Navigation */}
        <aside className="w-full md:w-56 flex-shrink-0 select-none">
          <h3 className="text-lg md:text-xl font-bold text-neutral-800 tracking-wider uppercase mb-4">
            Shop By Category
          </h3>
          <div className="flex flex-col">
            <span className="text-md font-bold text-neutral-900 mb-2 hidden md:block">Skincare</span>
            {/* Horizontal scroll for mobile/tablet, stack for desktop */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-4 md:gap-2.5 md:pl-3 md:pt-1 md:border-l md:border-neutral-200 md:ml-0.5 whitespace-nowrap">
              {subCategoriesList.map((sub) => {
                const isActive = activeSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setActiveSubCategory(sub)}
                    className={`text-sm md:text-xs text-left transition-all tracking-tight pb-0.5 ${
                      isActive
                        ? 'text-neutral-950 font-bold border-b-2 border-black md:border-none'
                        : 'text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <main className="flex-1">
          <p className="text-xs text-gray-400 mb-6">
            Showing: {products.length} products in "{activeSubCategory}"
          </p>

          {loading ? (
            <div className="text-sm text-neutral-400 py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-neutral-400 py-12">
              No products in "{activeSubCategory}" yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between h-full bg-white p-2 md:p-3 border border-neutral-100 rounded-md shadow-sm hover:shadow-md transition-all group"
                >
                  <div onClick={() => navigate(`/product/${item._id}`)} className="cursor-pointer">
                    <div className="w-full aspect-square bg-[#f9f9f9] rounded-sm flex items-center justify-center overflow-hidden mb-3 md:mb-4 p-2 md:p-4">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                        onError={e => { e.target.onerror = null; e.target.src = LOCAL_PLACEHOLDER; }}
                      />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase text-neutral-400 block mb-1 tracking-wider font-semibold truncate">
                      {item.brand?.trim() || 'Generic'}
                    </span>
                    <h4 className="text-xs md:text-sm font-medium text-neutral-800 line-clamp-2 min-h-[2.5rem] leading-tight mb-2">
                      {item.name}
                    </h4>
                    <span className="text-xs md:text-sm font-bold text-neutral-950 block mb-3 md:mb-4">
                      £{(item.sellingPrice || item.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full text-[10px] md:text-xs font-semibold uppercase tracking-wider py-2 md:py-2.5 rounded-none border border-neutral-900 text-neutral-900 bg-white hover:bg-black hover:text-white transition-all duration-200"
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Skincare;