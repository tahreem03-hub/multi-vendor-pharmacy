import React, { useState, useRef, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import {
  ArrowRight, HandCoins, Plus, Minus,
  ShoppingCart, ShoppingCartIcon, Truck, Headset,
  Mail, Phone, MapPin, ShieldCheck, Zap, Pill,
  Package, Star, ShoppingBag, Syringe, ClipboardList, Users, ChevronLeft, ChevronRight
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const faqData = [
  {
    question: "Do I need a prescription to buy medicines online?",
    answer: "Prescription-only medicines require a valid prescription from a licensed doctor. Over-the-counter medicines can be purchased without a prescription.",
  },
  {
    question: "How can I verify that the medicines are genuine?",
    answer: "All medicines are sourced from licensed and authorized suppliers. Each product is checked for authenticity, batch number, and expiry date before dispatch.",
  },
  {
    question: "What should I do if I receive the wrong medicine?",
    answer: "Contact our support team immediately. We will verify the issue and arrange a replacement or refund according to our pharmacy policy.",
  },
  {
    question: "Can I return medicines after purchase?",
    answer: "Due to health and safety regulations, medicines are generally non-returnable unless they are damaged, defective, or supplied incorrectly.",
  },
  {
    question: "How do I know if a medicine is in stock?",
    answer: "Product availability is displayed on each product page. If a medicine is temporarily unavailable, you can contact us for expected restock dates.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="bg-slate-900 py-24 px-8 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 mb-5">
            FAQs
          </span>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Everything you need to know about our platform and services.
          </p>
        </div>
        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl transition-all duration-300 border ${
                openIndex === index
                  ? 'bg-slate-800 border-slate-600'
                  : 'bg-white/5 border-white/5 hover:border-slate-600'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left gap-4"
              >
                <span className={`text-sm font-bold ${openIndex === index ? 'text-white' : 'text-slate-300'}`}>
                  {item.question}
                </span>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${openIndex === index ? 'bg-white' : 'bg-slate-700'}`}>
                  {openIndex === index
                    ? <Minus className="text-slate-900 w-3.5 h-3.5" />
                    : <Plus className="text-slate-300 w-3.5 h-3.5" />}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40' : 'max-h-0'}`}>
                <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product);
      setAdded(true);
      toast.success(`${product.name} added!`);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const price = product.sellingPrice || product.price || 0;

  return (
    <div className="group bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-500 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image area */}
      <div className="relative overflow-hidden bg-slate-700" style={{ height: '200px' }}>
        {product.image ? (
          <img
            src={`${BASE_URL}/${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-700">
            <Package className="w-12 h-12 text-slate-500" />
            <span className="text-xs text-slate-500 font-semibold">No Image</span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900/90 text-slate-200 px-2.5 py-1 rounded-full border border-slate-600">
            {product.category}
          </span>
        </div>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2 rounded-full text-xs font-black shadow-lg hover:bg-slate-100 transition-all active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-black text-white leading-snug mb-1.5 line-clamp-2">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-slate-400 font-medium mb-auto">{product.brand}</p>
        )}

        {/* Stock warning */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-2">
            Only {product.stock} left
          </p>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
          <p className="text-lg font-black text-white">
            £{Number(price).toFixed(2)}
          </p>
          <button
            onClick={handleAdd}
            disabled={adding}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all active:scale-90 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-white hover:text-slate-900'
            }`}
          >
            {added ? '✓' : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Home ──────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Dynamic slider trackers 
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const productCategories = [
    { name: 'Botulinum Toxins', count: '45 Products', icon: Pill },
    { name: 'Dermal Fillers', count: '82 Products', icon: Zap },
    { name: 'Skin Boosters', count: '34 Products', icon: HandCoins },
    { name: 'Fat Dissolvers', count: '28 Products', icon: Package },
    { name: 'Consumables', count: '40 Products', icon: ShieldCheck },
  ];

  // Fetch Sliders from API Configuration Track
  useEffect(() => {
    fetch(`${BASE_URL}/api/sliders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSliders(data);
        }
      })
      .catch((err) => console.error("Error setting up homepage hero sliders:", err));
  }, []);

  // Set up an autoplay lifecycle timer for the home track slider carousel
  useEffect(() => {
    if (sliders.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 6000); // Transitions slide every 6 seconds

    return () => clearInterval(slideInterval);
  }, [sliders]);

  useEffect(() => {
    API.get('/medicines')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.medicines || []);
        setProducts(data.slice(0, 6));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Inline Handlers to toggle manual track changes
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  return (
    <div className="font-poppins bg-slate-950">
      <main className="w-full">

        {/* ── NEW DYNAMIC HERO SLIDER ── */}
        <div className="relative bg-slate-950 min-h-[580px] flex items-center overflow-hidden border-b border-white/5">
          {sliders.length === 0 ? (
            /* Fallback default background layer if backend slider tracks are completely empty */
            <div className="w-full px-8 md:px-24 py-20 flex flex-col md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto text-white">
              <div className="space-y-6 max-w-xl">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                  Premium Aesthetic <br /><span className="text-slate-400">Pharmacy</span> Platform
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Welcome to DrGPharma. Log into the console to manage and view promotional displays here.
                </p>
              </div>
            </div>
          ) : (
            /* Main Render Carousels Loop Frame Section Wrapper */
            <div className="w-full relative min-h-[580px] flex items-center">
              {sliders.map((slide, index) => {
                // Formatting image file URLs matching target upload configurations
                const formattedImageUrl = slide.imageUrl?.startsWith("http")
                  ? slide.imageUrl
                  : `${BASE_URL}/${slide.imageUrl?.replace(/\\/g, "/")}` ;

                return (
                  <div
                    key={slide._id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex items-center py-20 px-8 md:px-24 ${
                      index === currentSlide 
                        ? "opacity-100 pointer-events-auto z-10 scale-100" 
                        : "opacity-0 pointer-events-none z-0 scale-95"
                    }`}
                  >
                    {/* Blurry Background Glowing Aesthetic Orbs */}
                    <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-slate-500/10 rounded-full blur-[140px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-16 z-10">
                      
                      {/* Formatted Content Side Panel Container */}
                      <div className="md:w-3/5 text-white space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                            GPhC Registered · 229 Products · Next Day Delivery
                          </p>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight break-words">
                          {slide.title}
                        </h1>

                        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                          {slide.description}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <button
                            onClick={() => navigate(slide.buttonLink || "/")}
                            className="group flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                          >
                            {slide.buttonText || "Learn More"}{" "}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                        <div className="flex gap-10 pt-4 border-t border-white/8">
                          {[['229+', 'Products'], ['48hr', 'Dispatch'], ['GPhC', 'Registered']].map(([val, label]) => (
                            <div key={label}>
                              <p className="text-2xl font-black text-white">{val}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display Image Uploaded File Asset Container Node */}
                      <div className="md:w-2/5 flex justify-center md:justify-end z-10">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-slate-400/15 rounded-[3rem] blur-3xl group-hover:bg-slate-400/25 transition-colors duration-700" />
                          <img
                            src={formattedImageUrl}
                            alt={slide.title}
                            className="w-72 md:w-80 lg:w-[380px] h-[450px] rounded-[3rem] shadow-2xl object-cover relative border border-white/8 transition-transform duration-500 group-hover:scale-[1.01]"
                            onError={(e) => { e.target.src = "https://placehold.co/600x800/0f172a/f1f5f9?text=Product+Display"; }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Slider Manual Trigger Navigation Toggles (Only show if multiple items are rendered) */}
              {sliders.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-slate-400 border border-white/10 hover:bg-white hover:text-slate-900 transition-all shadow-lg backdrop-blur-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-slate-400 border border-white/10 hover:bg-white hover:text-slate-900 transition-all shadow-lg backdrop-blur-sm"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dot Map Track Progress Array Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {sliders.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Feature Bar ── */}
        <div className="flex flex-nowrap justify-between items-center gap-8 px-10 lg:px-24 py-12 bg-slate-900 border-b border-slate-800 overflow-x-auto">
          {[
            { icon: Truck, title: "Free Shipping", sub: "Orders over £199" },
            { icon: ShieldCheck, title: "Secure Ordering", sub: "SSL Encrypted" },
            { icon: Zap, title: "Fast Dispatch", sub: "Next Working Day" },
            { icon: Pill, title: "Genuine Medicines", sub: "Licensed UK Supplier" },
            { icon: Headset, title: "Expert Support", sub: "Pharmacy Team" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 group shrink-0">
              <span className="p-3.5 bg-slate-800 text-slate-400 rounded-xl group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                <f.icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-white text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Marquee ── */}
        <div className="w-full overflow-hidden bg-slate-900 py-4 border-y border-slate-800">
          <div className="relative flex overflow-x-hidden py-3">
            {[1, 2].map(n => (
              <div key={n} className={`whitespace-nowrap flex gap-12 items-center ${n === 1 ? 'animate-marquee' : 'animate-marquee2 absolute top-3'}`}>
                {['Skin Boosters: Profhilo, Seventy Hyal, Jalupro', 'Weight Management: Fat Dissolving, Vitamin B12', 'Dermal Fillers: Lip, Cheek, Jawline', 'Botulinum Toxins: Anti-Wrinkle, Fine Lines'].map((t, i) => (
                  <React.Fragment key={i}>
                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t}</span>
                    <span className="text-white font-bold">✦</span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Products ── */}
        <section className="py-20 bg-slate-900 px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 mb-4">
                  Best Sellers
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Featured Products
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Top-rated aesthetic medicines from verified suppliers
                </p>
              </div>
              <button
                onClick={() => navigate('/trendpro')}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group shrink-0"
              >
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-pulse">
                    <div className="bg-slate-700" style={{ height: '200px' }} />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-700 rounded-full w-3/4" />
                      <div className="h-3 bg-slate-700 rounded-full w-1/2" />
                      <div className="h-5 bg-slate-700 rounded-full w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="w-full max-w-sm mx-auto">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-800 rounded-2xl border border-slate-700">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-semibold text-sm">No products available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Browse By Category ── */}
        <section className="py-20 bg-slate-950 px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 mb-5">
                Browse by Category
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Everything for Your Practice
              </h2>
              <p className="text-slate-500 text-sm mt-3">Premium products across all specialised categories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {productCategories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/trendpro')}
                  className="group relative bg-slate-800 p-7 rounded-2xl border border-slate-700 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-all duration-300 flex flex-col items-start overflow-hidden"
                >
                  <div className="w-11 h-11 bg-slate-700 group-hover:bg-white rounded-xl flex items-center justify-center mb-6 transition-all duration-300">
                    <cat.icon className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{cat.count}</p>
                  <div className="mt-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">View All</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why DrGPharma ── */}
        <section className="py-24 bg-slate-900 px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 mb-5">
                Why DrGPharma
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Built for Aesthetic Professionals
              </h2>
              <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
                Everything a modern aesthetic clinic needs, from a fully licensed UK pharmacy partner
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: "Genuine Products", desc: "All medicines sourced from licensed UK wholesalers with full cold chain integrity." },
                { icon: ClipboardList, title: "SwiftRx™", desc: "Integrated e-prescribing portal to generate and manage prescriptions in seconds." },
                { icon: Users, title: "PrescribeLink", desc: "Seamlessly link non-prescribers with registered partners for script validation." },
                { icon: Zap, title: "Fast Dispatch", desc: "Order by 3pm for next working day delivery in temperature-controlled packaging." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col items-center text-center hover:border-slate-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-white mb-3 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-24 bg-slate-950 px-8 lg:px-24 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 mb-5">
                Process
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                How DrGPharma Works
              </h2>
              <p className="text-slate-400 text-sm mt-4 max-w-xl mx-auto">
                A simple, compliant ordering process for aesthetic professionals
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                {[
                  { num: "1", title: "Register & Verify", desc: "Create your account. Prescribers verify their registration number. Non-prescribers link via PrescribeLink." },
                  { num: "2", title: "Browse & Select", desc: "Browse 229 products across 13 categories. Add OTC products directly. Request POM items via SwiftRx™." },
                  { num: "3", title: "Prescribe & Approve", desc: "Prescribers issue digital prescriptions via SwiftRx™. Time Pharmacy reviews and dispenses." },
                  { num: "4", title: "Deliver to Your Door", desc: "Orders dispatched next working day. Cold chain maintained for toxins and temperature-sensitive products." },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center mb-8 relative z-10 group-hover:border-slate-500 transition-all duration-300">
                      <span className="text-2xl font-black text-white">{step.num}</span>
                      <div className="absolute inset-2 rounded-full border border-slate-800 group-hover:border-slate-600 transition-colors" />
                    </div>
                    <div className="absolute inset-2 rounded-full border border-slate-800 group-hover:border-slate-600 transition-colors" />
                    <h3 className="text-base font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed px-2">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FAQ />

        {/* ── Footer ── */}
        <footer className="bg-slate-950 text-white pt-20 pb-10 px-8 md:px-24 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-14 mb-16">

              <div className="flex flex-col gap-5">
                <div className="text-xl font-black tracking-tight flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                    <Pill className="w-4 h-4 text-white" />
                  </div>
                  DrGPharma
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Empowering your health journey through expert medical guidance and technology-driven healthcare.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: MapPin, text: '123 Health Street, London, UK' },
                    { icon: Phone, text: '+44 20 0000 0000' },
                    { icon: Mail, text: 'support@drgpharma.com' },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-3 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                      <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={13} />
                      </div>
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Quick Links</h3>
                <ul className="flex flex-col gap-3 text-slate-500 text-sm">
                  {[
                    ['/', 'Home'],
                    ['/medicines', 'Medicines'],
                    ['/cart', 'Your Cart'],
                    ['/profile', 'My Account'],
                    ['/login', 'Login'],
                    ['/register', 'Register'],
                  ].map(([to, label]) => (
                    <li key={to}>
                      <Link to={to} className="hover:text-slate-300 transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Services</h3>
                <ul className="flex flex-col gap-3 text-slate-500 text-sm">
                  {['Online Pharmacy', 'Prescription Upload', 'Doctor Consultation', 'Health Diagnostics', 'Privacy Policy', 'Terms of Service'].map(s => (
                    <li key={s}>
                      <span className="hover:text-slate-300 transition-colors cursor-pointer">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Stay Connected</h3>
                <p className="text-slate-500 text-sm">Follow us for health tips, promotions and updates.</p>
                <div className="flex gap-2.5">
                  {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white/15 hover:text-white transition-all">
                      <Icon />
                    </a>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white mb-3 uppercase tracking-widest">Newsletter</h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-500"
                    />
                    <button className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">
                      Go
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-slate-600 text-xs">
              <p>© 2026 DrGPharma. All rights reserved.</p>
              <p>Designed for better healthcare ❤️</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default Home;