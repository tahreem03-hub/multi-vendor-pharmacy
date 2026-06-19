import React, { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import {
  ArrowRight, HandCoins, Plus, Minus, Check, Heart, CreditCard,
  ShoppingCart, Truck, Headset, Quote,
  Mail, Phone, MapPin, ShieldCheck, Zap, Pill,
  Package, Star, ClipboardList, Users, ChevronLeft, ChevronRight
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import API from '../api/axios';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 mb-4 tracking-wide uppercase">
    {children}
  </span>
);

const faqData = [
  {
    question: "Do I need a validated prescriber account to purchase Prescription-Only Medicines (POM)?",
    answer: "Yes. All Prescription-Only Medicines require clinical validation. Registered GMC, GPhC, NMC, or HCPC prescribers can order directly after professional verification, while non-prescribers must link accounts with their designated prescriber via PrescribeLink.",
  },
  {
    question: "How do you guarantee and verify product authenticity?",
    answer: "All injectables, toxins, and dermal fillers are sourced directly from licensed UK distributors and manufacturers. We operate under strict quality management procedures, maintaining full batch traceability and cold-chain logging.",
  },
  {
    question: "How are temperature-sensitive products like botulinum toxins shipped?",
    answer: "We use validated cold-chain packaging designed to maintain stable, chilled temperatures for up to 72 hours. All toxin shipments are dispatched via next-day delivery partners to guarantee clinical efficacy upon arrival.",
  },
  {
    question: "What is the daily cut-off time for next-day dispatch?",
    answer: "Orders submitted, payment cleared, and prescriptions approved before 3:00 PM Monday through Thursday are processed and shipped for next-working-day delivery.",
  },
  {
    question: "Can I return items if I order the incorrect product by mistake?",
    answer: "Due to MHRA regulations governing professional medical supplies, we cannot accept returns on prescription medications or temperature-sensitive items once they have left our pharmacy premises.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="bg-slate-50 py-24 px-8 lg:px-24 border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <Eyebrow>Support & Compliance</Eyebrow>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base max-w-lg mx-auto">
            Important information regarding account validation, regulatory compliance, and distribution policies.
          </p>
        </div>
        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl transition-all duration-300 border ${openIndex === index
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left gap-4"
              >
                <span className={`text-base font-semibold ${openIndex === index ? 'text-slate-900' : 'text-slate-700'}`}>
                  {item.question}
                </span>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${openIndex === index ? 'bg-blue-500' : 'bg-slate-100'}`}>
                  {openIndex === index
                    ? <Minus className="text-white w-3.5 h-3.5" />
                    : <Plus className="text-slate-500 w-3.5 h-3.5" />}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40' : 'max-h-0'}`}>
                <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

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
  const original = product.originalPrice || product.mrp || 0;
  const hasDiscount = original > price && price > 0;
  const discountPct = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;
  const inStock = (product.stock ?? 1) > 0;
  const lowStock = inStock && product.stock <= 5;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden">
      <div className="relative overflow-hidden bg-slate-100" style={{ height: '200px' }}>
        {product.image ? (
          <img
            src={`${BASE_URL}/${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100">
            <Package className="w-12 h-12 text-slate-300" />
            <span className="text-xs text-slate-400 font-semibold">No Image</span>
          </div>
        )}


        <span className="absolute top-3 left-3 flex flex-col gap-1.5 items-start text-[9px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
          {product.category}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAdd}
            disabled={adding || !inStock}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug mb-1.5 line-clamp-2">
          {product.name}
        </h3>

        {product.brand && (
          <p className="text-xs text-slate-500 font-medium mb-auto">{product.brand}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-slate-900">£{Number(price).toFixed(2)}</p>
            {hasDiscount && (
              <p className="text-xs text-slate-400 line-through">£{Number(original).toFixed(2)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !inStock}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-50 ${added
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'
              }`}
          >
            {added ? '✓' : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const reviews = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Aesthetic Clinic Owner",
    text: "Reliable next-day cold-chain logistics. Our botulinum toxin consignments arrive properly insulated and monitored. The digital signature framework on SwiftRx saves valuable clinic management hours.",
  },
  {
    name: "James Okafor",
    role: "Independent Prescriber",
    text: "PrescribeLink streamlines clinical approval pipelines between prescribers and partner clinics. The compliance controls are highly professional, providing excellent oversight of prescribing files.",
  },
  {
    name: "Lena Fischer",
    role: "Nurse Prescriber",
    text: "The inventory visibility is consistent and transparent. Dispatch notifications include batch numbers and expiry data, which makes clinic stock audits and logging direct and simple.",
  },
];

const Reviews = () => (
  <section className="py-24 px-8 lg:px-24 bg-white border-t border-slate-200">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <Eyebrow>Clinical Feedback</Eyebrow>
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
          Verified UK Practitioner Reviews
        </h2>
        <p className="text-slate-600 text-base mt-3 max-w-lg mx-auto">
          Providing compliant pharmaceutical distribution and digital prescription tooling for clinics nationwide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-xl border border-slate-200 p-7 flex flex-col hover:border-slate-300 hover:shadow-md transition-all duration-300"
          >
            <Quote className="w-8 h-8 text-blue-200 mb-4" />
            <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1">"{r.text}"</p>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 text-sm font-semibold">{r.name}</p>
                <p className="text-slate-500 text-xs">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const productCategories = [
    { name: 'Botulinum Toxins', count: '45 Products', icon: Pill, image: 'https://placehold.co/600x400/f1f5f9/64748b?text=Botulinum+Toxins' },
    { name: 'Dermal Fillers', count: '82 Products', icon: Zap, image: 'https://placehold.co/600x400/f1f5f9/64748b?text=Dermal+Fillers' },
    { name: 'Skin Boosters', count: '34 Products', icon: HandCoins, image: 'https://placehold.co/600x400/f1f5f9/64748b?text=Skin+Boosters' },
    { name: 'Fat Dissolvers', count: '28 Products', icon: Package, image: 'https://placehold.co/600x400/f1f5f9/64748b?text=Fat+Dissolvers' },
    { name: 'Consumables', count: '40 Products', icon: ShieldCheck, image: 'https://placehold.co/600x400/f1f5f9/64748b?text=Consumables' },
  ];

  const heroTrust = ['GPhC Premises Registered', 'Validated Cold-Chain Shipping', 'Same-Day Dispatch Cut-off', 'MHRA Verified Wholesalers'];

  useEffect(() => {
    fetch(`${BASE_URL}/api/sliders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSliders(data);
      })
      .catch((err) => console.error("Error setting up homepage hero sliders:", err));
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 6000);
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

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliders.length);

  return (
    <div className="font-sans bg-white text-slate-900">
      <main className="w-full">

        {/* ── HERO SECTION ── */}
        <div className="relative bg-gradient-to-b from-slate-100 via-slate-50 to-white overflow-hidden border-b border-slate-200">

          {/* Subtle Grid Background Pattern for clean division */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          {sliders.length === 0 ? (
            <div className="w-full px-8 md:px-24 py-24 flex flex-col md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto relative z-10">
              <div className="space-y-6 max-w-xl">
                <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight leading-[1.15] text-slate-900">
                  Licensed UK Aesthetic <br /><span className="text-blue-700">Pharmacy Supply</span>
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">
                  Log in to your clinic profile to access prescription-only stocks, prepare prescription forms, and coordinate shipping dates.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full relative min-h-[550px] md:min-h-[500px]">
              {sliders.map((slide, index) => {
                const isActive = index === currentSlide;
                const formattedImageUrl = slide.imageUrl?.startsWith("http")
                  ? slide.imageUrl
                  : `${BASE_URL}/${slide.imageUrl?.replace(/\\/g, "/")}`;

                return (
                  <div
                    key={slide._id}
                    className={`w-full transition-all duration-700 ease-in-out px-8 md:px-24 py-16 md:py-20 ${isActive ? "block relative opacity-100 z-10" : "hidden absolute opacity-0 z-0"
                      }`}
                  >
                    <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-100/30 rounded-full blur-[90px] -mr-24 -mt-24 pointer-events-none" />

                    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 relative z-10">

                      {/* Left: Copywriting Content */}
                      <div className="md:w-3/5 space-y-7 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                            Professional Sourcing · Batch Traceability · Temperature Tracked
                          </p>
                        </div>

                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-slate-900">
                          {slide.title}
                        </h1>

                        <p className="text-base text-slate-600 max-w-lg leading-relaxed">
                          {slide.description}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-1">
                          <button
                            onClick={() => navigate(slide.buttonLink || "/trendpro")}
                            className="group flex items-center gap-3 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95"
                          >
                            {slide.buttonText || "Shop Products"}{" "}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button
                            onClick={() => navigate("/trendpro")}
                            className="flex items-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-xl font-bold text-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                          >
                            View Categories
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-5 border-t border-slate-200 max-w-lg">
                          {heroTrust.map((t) => (
                            <div key={t} className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-700">
                              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              </span>
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Graphic Container */}
                      <div className="md:w-2/5 flex justify-center md:justify-end">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-blue-200/20 rounded-2xl blur-2xl group-hover:bg-blue-200/30 transition-colors duration-700" />
                          <img
                            src={formattedImageUrl}
                            alt={slide.title}
                            className="w-72 md:w-80 lg:w-[460px] h-[300px] rounded-2xl shadow-md border border-slate-200/80 object-cover relative transition-transform duration-500 group-hover:scale-[1.01]"
                            onError={(e) => { e.target.src = "https://placehold.co/600x800/f1f5f9/64748b?text=Product+Display"; }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {sliders.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white text-slate-500 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white text-slate-500 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {sliders.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── FEATURED PRODUCTS ── */}
        <section className="py-20 bg-white px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <Eyebrow>Clinic Essentials</Eyebrow>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Featured Supplies
                </h2>
                <p className="text-slate-600 text-base mt-2">
                  Traceable clinic stocks from MHRA-regulated UK distributors
                </p>
              </div>
              <button
                onClick={() => navigate('/trendpro')}
                className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors group shrink-0"
              >
                Browse Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="bg-slate-100" style={{ height: '200px' }} />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                      <div className="h-5 bg-slate-100 rounded-full w-1/3 mt-4" />
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
              <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold text-sm">No products available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ── POPULAR CATEGORIES ── */}
        <section className="py-20 bg-slate-50 px-8 lg:px-24 border-t border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <Eyebrow>Inventory Categories</Eyebrow>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Product Categories
              </h2>
              <p className="text-slate-600 text-base mt-3">Direct wholesale distribution of licensed cosmetic formulations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {productCategories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/trendpro')}
                  className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                      <cat.icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{cat.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{cat.count}</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-700 group-hover:text-blue-800 transition-colors">
                      <span className="text-xs font-semibold">View Products</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE BAR ── */}
        <div className="flex flex-nowrap justify-between items-center gap-8 px-10 lg:px-24 py-12 bg-white border-b border-slate-200 overflow-x-auto">
          {[
            { icon: Truck, title: "Free Shipping", sub: "Orders over £199" },
            { icon: ShieldCheck, title: "SSL Encrypted", sub: "Secure Order System" },
            { icon: Zap, title: "Fast Dispatch", sub: "Cut-off at 3:00 PM" },
            { icon: Pill, title: "Verified Sourcing", sub: "GPhC/MHRA Supply Chains" },
            { icon: Headset, title: "Clinical Support", sub: "Registered Pharmacists" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 group shrink-0">
              <span className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <f.icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── WHY DRGPHARMA ── */}
        <section className="py-24 bg-slate-50 px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Eyebrow>Pharmacy Standard</Eyebrow>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Designed For Clinical Operations
              </h2>
              <p className="text-slate-600 text-base mt-3 max-w-xl mx-auto">
                Supporting clinical safety and supply-chain efficiency for independent UK cosmetic practitioners.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-blue-100/30 rounded-2xl blur-2xl" />
                <img
                  src="https://placehold.co/800x600/e2e8f0/475569?text=Licensed+UK+Pharmacy"
                  alt="DrGPharma licensed UK pharmacy"
                  className="relative w-full h-[380px] object-cover rounded-2xl border border-slate-200 shadow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: ShieldCheck, title: "Direct Wholesaling", desc: "No grey-market products. Every batch is direct from MHRA-regulated UK supply structures." },
                  { icon: ClipboardList, title: "SwiftRx™ Portal", desc: "Write, sign, and authorize prescriptions digitally without physical documentation hold-ups." },
                  { icon: Users, title: "PrescribeLink Integration", desc: "Allows non-prescribing medical injectors to coordinate clinical oversight with validated prescribers." },
                  { icon: Zap, title: "Cold-Chain Control", desc: "A temperature-controlled logistics environment protecting protein structure integrity." },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-white px-8 lg:px-24 overflow-hidden border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <Eyebrow>Clinical Workflow</Eyebrow>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Account Validation & Ordering
              </h2>
              <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto">
                A regulatory-compliant structure matching GPhC distribution standards
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                {[
                  { num: "1", title: "Practitioner Onboarding", desc: "Complete account sign-up and register professional credentials (GMC, NMC, GPhC, HCPC) for quick validation." },
                  { num: "2", title: "Select Inventory", desc: "Select and secure emergency consumables, skin boosters, dermal fillers, or add POM items to prescription pipelines." },
                  { num: "3", title: "Prescription Sign-off", desc: "Complete clinical prescriptions digitally within the SwiftRx™ portal, or route them via your PrescribeLink partner." },
                  { num: "4", title: "Dispensing & Dispatch", desc: "Our registered UK pharmacy dispatches verified stock in chilled packaging where temperature monitoring is required." },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center mb-8 relative z-10 group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                      <span className="font-serif text-2xl font-semibold text-blue-600">{step.num}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed px-2">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CUSTOMER REVIEWS ── */}
        <Reviews />

        <FAQ />

        {/* ── FOOTER ── */}
        <footer className="bg-slate-900 text-white pt-20 pb-10 px-8 md:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-14 mb-14">

              <div className="flex flex-col gap-5">
                <div className="text-xl font-bold tracking-tight flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Pill className="w-4 h-4 text-white" />
                  </div>
                  DrGPharma
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Registered clinical supply routes delivering authentic pharmaceuticals, dermal fillers, and clinic-ready injectables across the United Kingdom.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: ShieldCheck, text: 'GPhC Registration No. 0000000' },
                    { icon: MapPin, text: 'Registered in England & Wales · Co. No. 00000000' },
                    { icon: Phone, text: '+44 20 0000 0000' },
                    { icon: Mail, text: 'support@drgpharma.com' },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                      <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={13} />
                      </div>
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-semibold text-white uppercase tracking-widest">Quick Links</h3>
                <ul className="flex flex-col gap-3 text-slate-400 text-sm">
                  {[
                    ['/', 'Home'],
                    ['/medicines', 'Medicines'],
                    ['/cart', 'Your Cart'],
                    ['/profile', 'My Account'],
                    ['/login', 'Login'],
                    ['/register', 'Register'],
                  ].map(([to, label]) => (
                    <li key={to}>
                      <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-semibold text-white uppercase tracking-widest">Pharmacy Services</h3>
                <ul className="flex flex-col gap-3 text-slate-400 text-sm">
                  {['Online Prescriptions', 'SwiftRx™ Tooling', 'PrescribeLink Accounts', 'Validated Cold Chain', 'Privacy Policy', 'Terms & Conditions'].map(s => (
                    <li key={s}>
                      <span className="hover:text-white transition-colors cursor-pointer">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-semibold text-white uppercase tracking-widest">Stay Connected</h3>
                <p className="text-slate-400 text-sm">Sign up for stock restock alerts, regulatory compliance news, and professional service notifications.</p>
                <div className="flex gap-2.5">
                  {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:text-white transition-all">
                      <Icon />
                    </a>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-widest">Newsletter</h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pb-8 border-b border-white/10">
              {[
                { icon: ShieldCheck, label: 'GPhC Registered' },
                { icon: ShieldCheck, label: 'Secure Checkout' },
                { icon: CreditCard, label: 'Visa' },
                { icon: CreditCard, label: 'Mastercard' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300">
                  <Icon className="w-4 h-4 text-slate-400" />
                  {label}
                </span>
              ))}
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-slate-500 text-xs">
              <p>© 2026 DrGPharma. All rights reserved.</p>
              <p>Registered GPhC Pharmacy Premises</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default Home;