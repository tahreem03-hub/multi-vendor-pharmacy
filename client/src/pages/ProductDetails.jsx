import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, Beaker, AlertCircle,
  FileText, Calendar, HardDrive, Factory,
  Layers, ChevronRight, Loader2,
} from 'lucide-react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [quantity, setQuantity]     = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [adding, setAdding]         = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/medicines/${id}`);
        const data = response.data.medicine || response.data;
        setProduct(data);
        setActiveImage(data.image || data.primaryImage);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Product not found");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} units available`);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ ...product, quantity });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handlePrescriptionRedirect = () => {
    navigate('/prescription-form');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-600" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 font-bold">Product not found.</div>
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://localhost:4000/${cleanPath}`;
  };

  const extraImages = product.additionalImages || product.images || [];
  const allImages   = [product.image || product.primaryImage, ...extraImages].filter(Boolean);
  const usageText   = product.howToUse  || product.usageInstructions || product.instructions;
  const safetyText  = product.safetyInfo || product.safetyWarnings   || product.precautions;
  const outOfStock  = (product.stock || 0) === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white font-poppins">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-6 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ── Gallery ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100 aspect-square relative overflow-hidden">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className="max-h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto py-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                  activeImage === img
                    ? 'border-cyan-500 scale-105 shadow-md'
                    : 'border-transparent bg-gray-50 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`View ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Details ───────────────────────────────────────────── */}
        <div className="flex flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {product.category || 'Clinical Medicine'}
              </span>

              {product.prescriptionRequired ? (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-red-100">
                  <FileText size={12} /> Prescription Required
                </span>
              ) : (
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-green-100">
                  OTC — No Prescription
                </span>
              )}

              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-auto">
                SKU: {product.sku || 'N/A'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Factory size={14} />
                <span>Brand: <b className="text-gray-800">{product.brand || 'N/A'}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Layers size={14} />
                <span>Supplier: <b className="text-gray-800">{product.supplier || 'N/A'}</b></span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Retail Price</label>
              <span className="text-lg font-bold text-gray-900">
                £{(product.sellingPrice || product.price || 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Stock Status</label>
              <span className={`text-lg font-bold ${outOfStock ? 'text-red-500' : 'text-gray-900'}`}>
                {outOfStock ? 'Out of Stock' : `${product.stock} Units`}
              </span>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <Beaker size={18} className="text-cyan-500" />
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Strength</p>
                <p className="text-xs font-bold">{product.dosage || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <Calendar size={18} className="text-cyan-500" />
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Expiry</p>
                <p className="text-xs font-bold">
                  {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-900 mb-2 flex items-center gap-2">
                <HardDrive size={14} className="text-cyan-500" /> Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            {usageText && (
              <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100">
                <h3 className="text-[10px] font-bold uppercase text-cyan-700 mb-1">Usage Instructions</h3>
                <p className="text-cyan-900 text-xs leading-relaxed font-medium">{usageText}</p>
              </div>
            )}

            {safetyText && (
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="text-[10px] font-bold uppercase text-orange-700 mb-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Safety & Precautions
                </h3>
                <p className="text-orange-900 text-xs leading-relaxed font-medium">{safetyText}</p>
              </div>
            )}
          </div>

          {/* POM warning banner */}
          {product.prescriptionRequired && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                This is a prescription-only medicine. You must submit a valid prescription before your order can be dispensed.
                <button onClick={handlePrescriptionRedirect} className="ml-1 font-bold underline">
                  Submit prescription →
                </button>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex gap-3 items-center">

              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-white h-12">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 font-bold hover:text-cyan-600"
                >
                  −
                </button>
                <span className="px-2 min-w-[30px] text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="px-4 font-bold hover:text-cyan-600"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={adding || outOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all
                  ${outOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-md shadow-cyan-100'
                  }`}
              >
                {adding
                  ? <><Loader2 size={14} className="animate-spin" /> Adding...</>
                  : outOfStock
                  ? 'Out of Stock'
                  : <><ShoppingCart size={14} /> Add to Cart</>
                }
              </button>
            </div>

            {/* Go to cart */}
            <button
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all"
            >
              View Cart & Checkout <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;