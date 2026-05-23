import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import API from '../api/axios'; 
import { useCart } from '../context/CartContext'; 

const Injectable = () => {
  const navigate = useNavigate(); // Hook initialization
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const subCategoriesList = [
    "Toxins",
    "HA Fillers",
    "Skin Boosters",
    "Polynucleotides"
  ];

  const [activeSubCategory, setActiveSubCategory] = useState("Toxins");

  const cartContext = useCart();
  const handleQuickAdd = cartContext?.handleQuickAdd 
    ? cartContext.handleQuickAdd 
    : (item) => console.log("CartContext not found. Added item locally:", item);

  useEffect(() => {
    const fetchInjectableProducts = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/medicines`, {
          params: {
            category: "Injectables",
            subCategory: activeSubCategory
          }
        });
        
        const data = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
        setProducts(data);
      } catch (error) {
        console.error("Error loading injectable items:", error);
      }
      setLoading(false);
    };

    fetchInjectableProducts();
  }, [activeSubCategory]);

  // Local SVG placeholder encoded to Base64
  const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'>No Image Available</text></svg>";

  const getProductImage = (imagePath) => {
    if (!imagePath) return LOCAL_PLACEHOLDER;
    
    // If it's already a full URL, return it as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Dynamically pull the baseURL setup in your axios file (e.g., "http://localhost:5000/api")
    const apiBase = API.defaults.baseURL || '';
    
    // Extract the root domain (e.g., "http://localhost:5000") by stripping trailing paths
    const serverUrl = apiBase.split('/api')[0]; 

    // Normalize slashes to avoid double slashes (//) in the path
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${serverUrl}${cleanPath}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-white font-sans text-left">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* LEFT SIDEBAR: Navigation Panel */}
        <aside className="w-full md:w-56 flex-shrink-0 select-none">
          <h3 className="text-xl font-bold text-neutral-800 tracking-wider uppercase mb-5">
            Shop By Category
          </h3>
          
          <div className="flex flex-col">
            <span className="text-md font-bold text-neutral-900 mb-2 block">
              Injectables
            </span>

            <div className="flex flex-col pl-3 pt-1 gap-2.5 border-l border-neutral-200 ml-0.5">
              {subCategoriesList.map((sub) => {
                const isActive = activeSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setActiveSubCategory(sub)}
                    className={`text-xs text-left transition-all tracking-tight pb-0.5 ${
                      isActive 
                        ? 'text-neutral-950 font-bold border-b-2 border-black self-start' 
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

        {/* RIGHT DISPLAY: Filtered Products View Grid */}
        <main className="flex-1">
          {/* <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-6">
            {products.length} Products Found
          </div> */}

          {loading ? (
            <div className="text-sm text-neutral-400 py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-neutral-400 py-12">
              No products available in this sub-category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <div key={item._id} className="flex flex-col justify-between h-full bg-white p-3 border border-neutral-100 rounded-md shadow-sm hover:shadow-md transition-all group">
                  
                  {/* Click handler added around the upper card content view */}
                  <div 
                    onClick={() => navigate(`/product/${item._id}`)} 
                    className="cursor-pointer"
                  >
                    {/* Fixed Product Image Frame Container */}
                    <div className="w-full aspect-square bg-[#f9f9f9] rounded-sm flex items-center justify-center overflow-hidden mb-4 p-4">
                      <img 
                        src={getProductImage(item.image)} 
                        alt={item.name} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = LOCAL_PLACEHOLDER;
                        }}
                      />
                    </div>

                    {/* Brand Identifier */}
                    <span className="text-[10px] uppercase text-neutral-400 block mb-1 tracking-wider font-semibold truncate">
                      {item.brand && item.brand.trim() !== "" ? item.brand : "Generic"}
                    </span>
                    
                    {/* Product Name Title */}
                    <h4 className="text-sm font-medium text-neutral-800 line-clamp-2 min-h-[2.5rem] leading-tight mb-2">
                      {item.name}
                    </h4>
                    
                    <span className="text-sm font-bold text-neutral-950 block mb-4">
                      £{item.price ? item.price.toFixed(2) : "0.00"}
                    </span>
                  </div>

                  {/* Add to Order Button */}
                  <button 
                    onClick={() => handleQuickAdd(item)}
                    className="w-full text-xs font-semibold uppercase tracking-wider py-2.5 rounded-none border border-neutral-900 text-neutral-900 bg-white hover:bg-black hover:text-white transition-all duration-200"
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

export default Injectable;