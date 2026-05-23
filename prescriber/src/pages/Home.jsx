import React, { useEffect, useState, useRef } from 'react';
import {
  ShoppingCart, Truck, ShieldCheck, RefreshCw, Headphones,
  Star, ChevronRight, Heart, Zap, Award, Users, ArrowRight,
  CheckCircle, Clock, Package, ChevronLeft, Film
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import TrendPro from './TrendPro';

// ── Intersection Observer hook for scroll animations ──────────
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── Feature card ──────────────────────────────────────────────
const Feature = ({ icon, title, desc, delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">{title}</p>
        <p className="text-indigo-600 font-semibold text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
};

// ── Product card ──────────────────────────────────────────────
const ProductCard = ({ item, onAdd, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [wished, setWished] = useState(false);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
        <img
src={`http://localhost:4000/uploads/${item.image}`}
          alt={item.name}
          className="max-h-[75%] object-contain group-hover:scale-110 transition-transform duration-700"
          onError={e => { e.target.src = 'https://via.placeholder.com/150'; }}
        />
        {/* Wishlist */}
        <button
          onClick={() => setWished(w => !w)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${wished ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-400 shadow'}`}
        >
          <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
        </button>
        {/* Badge */}
        {item.stock <= 5 && item.stock > 0 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-5">
        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
        </div>
        <h3 className="font-bold text-gray-800 mb-1 truncate text-sm">{item.name}</h3>
        {item.category && <p className="text-xs text-gray-400 mb-3">{item.category}</p>}
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-indigo-900">
            £{(item.sellingPrice || item.price || 0).toFixed(2)}
          </span>
          <button
            onClick={() => onAdd(item)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat counter ──────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon, delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3">
        <Icon size={22} className="text-indigo-700" />
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
const Home = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [mediaItems, setMediaItems] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const { addToCart } = useCart();
  
  const sliderRef = useRef(null); 
  const trendProSliderRef = useRef(null); 
  const [whyRef, whyInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [mediaRef, mediaInView] = useInView();
  const [videoSectionRef, videoSectionInView] = useInView();

  const [posts, setPosts] = useState([]);

  // Mouse Drag to Scroll Tracking States
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);


  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);

    API.get('/medicines')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.medicines || []);
        setTopProducts(data.slice(0, 6));
      })
      .catch(console.error);

    API.get('/sliders')
      .then(res => {
        if (Array.isArray(res.data)) {
          setSliders(res.data);
        }
      })
      .catch(err => console.error("Error loading sliders:", err));

    API.get('/media') 
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.media || []);
        setMediaItems(data);
      })
      .catch(err => console.error("Error fetching media items records:", err));

      API.get('/posts')
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setPosts(data);
    })
    .catch(err => console.error("Error fetching posts:", err));
  }, []);
    

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders]);

  const handleQuickAdd = async (product) => {
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Please login to add items');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      sliderRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const scrollTrendPro = (direction) => {
    if (trendProSliderRef.current) {
      const offset = direction === 'left' ? -450 : 450;
      trendProSliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    isDown.current = true;
    trendProSliderRef.current.classList.add('active');
    startX.current = e.pageX - trendProSliderRef.current.offsetLeft;
    scrollLeftState.current = trendProSliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - trendProSliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; 
    trendProSliderRef.current.scrollLeft = scrollLeftState.current - walk;
  };

  // Filter video elements dynamically
  const videoItems = mediaItems.filter(item => 
    item.mediaType === 'video' || 
    (item.image && /\.(mp4|mov|webm)$/i.test(item.image))
  );

  return (
    <div className="bg-white overflow-x-hidden">

   
     {/* ── 1. DYNAMIC HERO SLIDER SECTION ── */}
      <section className="min-h-[80vh]  relative overflow-hidden flex items-center">
        {sliders.length > 0 && (
          <div className="w-full relative h-[80vh] flex items-center">
            {sliders.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1000 ease-in-out px-8 md:px-20 ${
                  index === currentSlide ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
                }`}
              >
                <div className="absolute inset-0 w-full h-full z-0">
                  <img
                    src={`http://localhost:4000/${slide.imageUrl}`}
                    alt={slide.title}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x800?text=Pharmacy+Supplies'; }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="text-white z-10 text-left space-y-4 max-w-lg relative">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-white text-xs md:text-sm leading-relaxed max-w-sm">
                    {slide.description}
                  </p>
                  
                  {slide.buttonText && (
                    <div className="pt-2">
                      {slide.buttonLink?.startsWith('http') ? (
                        <a
                          href={slide.buttonLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                          {slide.buttonText} <ArrowRight size={15} />
                        </a>
                      ) : (
                        <Link
                          to={slide.buttonLink || "/trendpro"}
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                          {slide.buttonText} <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sliders.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 z-20 p-2.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all border border-white/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 z-20 p-2.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all border border-white/10"
                >
                  <ChevronRight size={20} />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {sliders.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ── 2. FEATURES MARQUEE ── */}
      <section className="py-4 bg-white text-black overflow-hidden border-b border-indigo-100 select-none relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 25s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-16 text-md font-semibold tracking-wide">
            <span>Free delivery on orders over £400</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Exclusive Brands</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Multi Award Winning</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Skincare</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Market Leading Distribution</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Fat Dissolvers</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Botulinum Toxins</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />

            <span>Free delivery on orders over £400</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Exclusive Brands</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Multi Award Winning Market Leading Distribution</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Skincare</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Fat Dissolvers</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
            <span>Botulinum Toxins</span>
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── TRENDPRO CAROUSEL SECTION WITH DRAG SCROLLING ── */}
      <section className="py-16 px-6 md:px-20 relative select-none">
        <div className="max-w-7xl mx-auto relative">
          <div 
            ref={trendProSliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="overflow-x-auto cursor-grab active:cursor-grabbing select-none w-full scrollbar-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex flex-row gap-6 pb-4 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&>*]:shrink-0 [&_div]:shrink-0">
              <TrendPro isHomePage={true} />
            </div>
          </div>

          <style>{`
            div::-webkit-scrollbar {
              display: none !important;
            }
          `}</style>
        </div>
      </section>

      {/* ── 3. TILES & STATS ── */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-center items-center">
          <div className="relative group w-full md:w-1/3 overflow-hidden rounded-md shadow-sm cursor-pointer">
            <img src="/largetile_hainjectables-BTwIh-s7.jpg" alt="HA Injectables" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-3 bg-white text-black text-sm tracking-wider rounded-xl shadow-md transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">shop now</button>
          </div>
          <div className="relative group w-full md:w-1/3 overflow-hidden rounded-md shadow-sm cursor-pointer">
            <img src="/largetile_regensolutions-BDJZDg5h.jpg" alt="Regen Solutions" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-3 bg-white text-black text-sm tracking-wider rounded-xl shadow-md transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">shop now</button>
          </div>
          <div className="relative group w-full md:w-1/3 overflow-hidden rounded-md shadow-sm cursor-pointer">
            <img src="/largetile_toxins-CsZ2azkv.jpg" alt="Toxins" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-3 bg-white text-black text-sm tracking-wider rounded-xl shadow-md transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">shop now</button>
          </div>
        </div>
      </section>

     <section className="py-4 px-6 md:px-20 bg-white">
 
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
    
    
    <div className="flex flex-col items-center text-center group cursor-pointer w-full sm:w-auto flex-shrink-0">
      <div className="w-full sm:w-48 h-64 md:h-52 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all duration-300">
        <img src="/girl.jpg" alt="Obagi Medical" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs font-bold tracking-widest text-slate-800">OBAGI MEDICAL</p>
    </div>

    <div className="flex flex-col items-center text-center group cursor-pointer w-full sm:w-auto flex-shrink-0">
      <div className="w-full sm:w-48 h-64 md:h-52 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all duration-300">
        <img src="/sun.jpg" alt="Medik8" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs font-bold tracking-widest text-slate-800">MEDIK8</p>
    </div>

    <div className="flex flex-col items-center text-center group cursor-pointer w-full sm:w-auto flex-shrink-0">
      <div className="w-full sm:w-48 h-64 md:h-52 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all duration-300">
        <img src="/jan.jpg" alt="Jan Marini" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs font-bold tracking-widest text-slate-800">JAN MARINI</p>
    </div>

    <div className="flex flex-col items-center text-center group cursor-pointer w-full sm:w-auto flex-shrink-0">
      <div className="w-full sm:w-48 h-64 md:h-52 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all duration-300">
        <img src="/yu.jpg" alt="Epionce" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs font-bold tracking-widest text-slate-800">EPIONCE</p>
    </div>

    <div className="flex flex-col items-center text-center group cursor-pointer w-full sm:w-auto flex-shrink-0">
      <div className="w-full sm:w-48 h-64 md:h-52 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all duration-300">
        <img src="/jane.jpg" alt="Jane Iredale" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <p className="text-xs font-bold tracking-widest text-slate-800">JANE IREDALE</p>
    </div>

  </div>
</section>

  
      <section ref={mediaRef} className="py-12 px-6 md:px-20 bg-white select-none overflow-hidden">
        <div
          className={`max-w-7xl mx-auto relative transition-all duration-1000 ${
            mediaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {mediaItems.length === 0 ? (
            <div className="py-12 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-400 font-medium">
                No custom dashboard images uploaded yet.
              </p>
            </div>
          ) : (
            <>
              <style>{`
                @keyframes scrollLeft {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .auto-scroll-track {
                  display: flex;
                  gap: 12px;
                  width: max-content;
                  animation: scrollLeft 20s linear infinite;
                }
                .auto-scroll-track:hover {
                  animation-play-state: paused;
                }
              `}</style>

              <div className="overflow-hidden w-full">
                <div className="auto-scroll-track">
                  {[...mediaItems, ...mediaItems].map((item, i) => (
                    <div
                      key={`${item._id}-${i}`}
                      className="w-[80px] sm:w-[100px] md:w-[110px] shrink-0 overflow-hidden group"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl">
                        <img
                          src={`http://localhost:4000/${item.imageUrl || item.image}`}
                          alt={item.title || 'Uploaded Update'}
                          className="w-[600px] h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Image';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 5. RESPONSIVE FLEX VIDEO GRID SECTION (FIXED SPACING) ── */}
      <section ref={videoSectionRef} className="py-16 px-6 md:px-20 bg-slate-50">
        <div 
          className={`max-w-7xl mx-auto transition-all duration-1000 ${
            videoSectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
  <h1 className="text-base font-medium text-gray-800 mb-2">
    For more details and if u have any <br />
    Query just visit our instagram page.
  </h1>
  <a 
    href="https://www.instagram.com/drgclinics?igsh=eDUzMGczc29lY3Jr" 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-block text-indigo-600 hover:text-indigo-800 font-semibold underline transition-colors mb-3"
  >
    Visit our Instagram
  </a>
</div>
          

          {videoItems.length === 0 ? (
            <div className="py-16 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center bg-white">
              <Film className="text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400 font-medium">
                No local showcase videos uploaded yet.
              </p>
            </div>
          ) : (
            
            /* Layout container: centers items and manages gap distance tightly */
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center md:items-stretch gap-4">
              {videoItems.slice(0, 3).map((video) => (
                <div 
                  key={video._id} 
                  className="w-full sm:w-[280px] md:w-auto md:flex-1 min-w-[240px] max-w-[340px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  {/* Portrait 9:16 Video Player Container */}
                  <div className="relative aspect-[9/16] bg-black overflow-hidden w-full">
                    <video
                      src={`http://localhost:4000/${video.image}`}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  </div>
                  
                  {/* Footer Text Details */}
                  {video.title && (
                    <div className="p-4 border-t border-gray-50 bg-white">
                      <p className="text-xs font-bold text-gray-800 truncate text-center uppercase tracking-wide">
                        {video.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div>
            <h1>
            
            </h1>
          </div>
        </div>
     

      </section>
      {/* ── 6. POSTS SECTION ── */}
<section className="py-16 px-6 md:px-20">
  <div className="max-w-7xl">
    
   <h2 className="text-2xl font-bold mb-8">Updated Posts</h2>

    {posts.length === 0 ? (
      <p className="text-gray-400">No posts uploaded yet</p>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map(post => (
          <div key={post._id} className="overflow-hidden shadow-sm">
            
           <img key={post._id} src={`http://localhost:4000/${post.image}`} className="w-full h-48 md:h-72 object-cover rounded-lg" />

          </div>
        ))}
      </div>
    )}

  </div>
</section>

    </div>
  );
};

export default Home;