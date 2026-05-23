import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Added Link import
import API from "../api/axios";
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const TrendPro = ({ isHomePage = false }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const localSliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);

  const categories = [
    "All", "Botulinum Toxins", "Dermal Fillers", "Skin Boosters", 
    "Fat Dissolvers", "Mesotherapy", "Anesthetics", "Skincare", "Consumables", "Injectables"
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await API.get("/medicines");
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data.medicines || []);
        
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading products:", error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const displayProducts = isHomePage 
    ? products.slice(0, 8) 
    : (selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory));

  const handleAddToCart = async (e, item) => {
    e.preventDefault(); // Prevents Link navigation when clicking button
    e.stopPropagation(); 
    if (added[item._id]) return;

    try {
      await addToCart(item); 
      setAdded(prev => ({ ...prev, [item._id]: true }));
      toast.success(`${item.name} added to cart!`);
      setTimeout(() => { setAdded(prev => ({ ...prev, [item._id]: false })); }, 2000);
    } catch (error) {
      toast.error("Please login to add items");
    }
  };

  const scrollCarousel = (direction) => {
    if (localSliderRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      localSliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    if (!isHomePage) return;
    isDown.current = true;
    startX.current = e.pageX - localSliderRef.current.offsetLeft;
    scrollLeftState.current = localSliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => { isDown.current = false; };
  const handleMouseUp = () => { isDown.current = false; };

  const handleMouseMove = (e) => {
    if (!isDown.current || !isHomePage) return;
    e.preventDefault();
    const x = e.pageX - localSliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    localSliderRef.current.scrollLeft = scrollLeftState.current - walk;
  };

  const SkeletonCard = () => (
    <div className={`bg-white border-b border-slate-100 p-4 animate-pulse ${isHomePage ? 'w-[260px] shrink-0' : ''}`}>
      <div className="aspect-[4/3] bg-slate-100 mb-4" />
      <div className="h-3 bg-slate-100 w-1/4 mb-2" />
      <div className="h-4 bg-slate-100 w-5/6 mb-4" />
      <div className="h-4 bg-slate-100 w-1/3 mb-4" />
      <div className="h-10 bg-slate-100 w-full" />
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto font-sans bg-white ${isHomePage ? 'px-0 py-4' : 'px-4 py-12'}`}>
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4 bg-white">
        {/* Changed text color to slate-600 with medium weight */}
        <h2 className="text-lg font-medium tracking-wide text-slate-600 uppercase">
          {isHomePage ? "Our Best Sellers" : (selectedCategory === "All" ? "All Products" : selectedCategory)}
        </h2>
        {isHomePage && (
          <div className="flex items-center gap-2 bg-white">
            {/* Changed view button text styling */}
            <button onClick={() => navigate('/trendpro')} className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors mr-2">View All</button>
            <button onClick={() => scrollCarousel('left')} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-neutral-800 hover:border-neutral-400 transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => scrollCarousel('right')} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-neutral-800 hover:border-neutral-400 transition-all active:scale-95"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-white">
        {!isHomePage && (
          <aside className="w-full md:w-56 flex-shrink-0 bg-white">
            <div className="sticky top-24 bg-white">
              {/* Categorization header styled to matching layout constraints */}
              <h3 className="text-xs font-bold text-slate-600 tracking-widest uppercase mb-4 px-1">Categories</h3>
              <nav className="flex flex-col border-t border-slate-100 bg-white">
                {categories.map((cat) => (
                  /* Updated category action buttons layout mapping rules */
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left py-3 px-1 text-sm transition-all border-b border-slate-100 font-medium ${selectedCategory === cat ? 'text-slate-900 pl-2 border-l-2 border-l-slate-600' : 'text-slate-600 hover:text-slate-900 hover:pl-2'}`}>
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-hidden bg-white">
          <div ref={localSliderRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} className={`${isHomePage ? 'flex flex-row gap-6 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing scrollbar-none select-none scroll-smooth bg-white' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 bg-white'}`} style={isHomePage ? { scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } : {}}>
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : displayProducts.map((item) => {
                  const price = item.sellingPrice || item.price;
                  const isAdded = added[item._id];

                  return (
                    // 2. Replaced div with Link for reliable navigation
                    <Link
                      key={item._id}
                      to={`/product/${item._id}`}
                      className={`group flex flex-col cursor-pointer bg-white transition-all duration-300 ${isHomePage ? 'w-[250px] sm:w-[270px] shrink-0' : 'w-full'}`}
                    >
                      <div className="aspect-[4/3] mb-4 flex items-center justify-center overflow-hidden bg-white relative border border-slate-100 rounded-sm">
                        {item.image ? (
                          <img src={item.image.startsWith('http') ? item.image : `http://localhost:4000/${item.image.replace(/\\/g, '/')}`} alt={item.name} className="max-w-full max-h-[85%] object-contain transition-transform duration-500 group-hover:scale-105" draggable="false" onError={(e) => { e.target.src = '/default.png'; }} />
                        ) : (
                          <div className="w-full h-full bg-white" />
                        )}
                        {item.category === "Botulinum Toxins" && (
                          <div className="absolute bottom-0 left-0 bg-slate-600 text-[9px] text-white font-medium px-2 py-1 flex items-center gap-1 uppercase tracking-widest">Volume based discounts</div>
                        )}
                      </div>
                      {/* Set category and product name styling safely to medium slate-600 fields */}
                      <span className="text-[15px] text-slate-600 font-medium tracking-widest mb-1">{item.category || "Injectables"}</span>
                      <h3 className="text-md font-medium text-slate-600 tracking-tight line-clamp-1 min-h-[18px] mb-1 group-hover:text-slate-900 transition-colors">{item.name}</h3>
                      <p className="text-md font-bold text-slate-600 mb-3">£{price ? Number(price).toFixed(2) : "0.00"}</p>
                      <div className="mt-auto bg-white">
                        <button type="button" onClick={(e) => handleAddToCart(e, item)} disabled={isAdded} className={`w-full py-2.5 text-[10px] font-bold tracking-wider uppercase border border-slate-200 transition-all ${isAdded ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-600 hover:bg-slate-600 hover:text-white hover:border-slate-600'}`}>
                          {isAdded ? "Added to Order" : "Add to Order"}
                        </button>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </main>
      </div>
      <style>{` ::-webkit-scrollbar { display: none !important; } `}</style>
    </div>
  );
};

export default TrendPro;