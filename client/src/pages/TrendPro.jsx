import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Check, Star, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from "../api/axios";
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const TrendPro = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [visible, setVisible] = useState([]);
  
  // --- NEW STATE FOR CATEGORIES ---
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Botulinum Toxins",
    "Dermal Fillers",
    "Skin Boosters",
    "Fat Dissolvers",
    "Mesotherapy",
    "Anesthetics",
    "Skincare",
    "Consumables"
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await API.get("/medicines");
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data.medicines || []);
        
        // Note: Removed the .slice(0, 8) so you can see all products per category
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading products:", error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  useEffect(() => {
    if (!loading && filteredProducts.length) {
      setVisible([]); // Reset visibility for new animations
      filteredProducts.forEach((_, i) => {
        setTimeout(() => {
          setVisible(prev => [...prev, i]);
        }, i * 70);
      });
    }
  }, [loading, selectedCategory, filteredProducts.length]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); 
    if (added[product._id]) return;

    try {
      await addToCart(product);
      setAdded(prev => ({ ...prev, [product._id]: true }));
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => {
        setAdded(prev => ({ ...prev, [product._id]: false }));
      }, 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please login first.");
    }
  };

  const SkeletonCard = ({ delay }) => (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
      <div className="h-2.5 bg-gray-100 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-100 rounded mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-5 bg-gray-100 rounded w-16" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white font-sans">
      {loading && (
        <div className="h-0.5 bg-gray-100 rounded mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded"
            style={{ animation: 'loadBar 1.2s ease forwards' }}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-6 px-2">
              <LayoutGrid className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Categories</h3>
            </div>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center group ${
                    selectedCategory === cat 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                    : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  {cat}
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2
                className="text-3xl font-semibold text-gray-800"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {selectedCategory === "All" ? "Trending" : selectedCategory} <span className="text-green-600">Products</span>
              </h2>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-all group">
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {loading
              ? Array(6).fill(0).map((_, i) => (
                  <SkeletonCard key={i} delay={i * 50} />
                ))
              : filteredProducts.map((item, i) => {
                  const isVisible = visible.includes(i);
                  const isAdded = added[item._id];
                  const price = item.sellingPrice || item.price;
                  const originalPrice = Math.round(price * 1.1);

                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="bg-white border border-gray-100 rounded-2xl p-4 group relative overflow-hidden cursor-pointer"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(22,163,74,0.13)';
                        e.currentTarget.style.borderColor = 'rgba(22,163,74,0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="aspect-square mb-4 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden p-4">
                        {item.image ? (
                          <img
src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads/${item.image}`}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-700 mb-4 line-clamp-2 min-h-[40px]">
                        {item.name}
                      </h3>

                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, si) => (
                          <Star
                            key={si}
                            className="w-3 h-3 fill-orange-400 text-orange-400"
                            style={{
                              opacity: isVisible ? 1 : 0,
                              transform: isVisible ? 'scale(1)' : 'scale(0)',
                              transition: `opacity 0.3s ${(i * 70) + (si * 60)}ms, transform 0.3s ${(i * 70) + (si * 60)}ms cubic-bezier(0.22,1,0.36,1)`,
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400 line-through">
                            £{originalPrice}.00
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            £{price}.00
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          disabled={added[item._id]}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md shadow-green-200 transition-all duration-200 active:scale-90 relative z-10"
                          style={{ background: isAdded ? '#15803d' : '#16a34a' }}
                          onMouseEnter={e => { if (!isAdded) e.currentTarget.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                        >
                          {isAdded
                            ? <Check className="w-4 h-4" strokeWidth={2.5} />
                            : <ShoppingCart className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400 italic">
              No products found in the "{selectedCategory}" category.
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        /* Custom scrollbar for sticky sidebar if needed */
        .sticky::-webkit-scrollbar {
          width: 4px;
        }
        .sticky::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default TrendPro;