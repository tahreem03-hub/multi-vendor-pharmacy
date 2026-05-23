import { useState, useEffect } from "react";
import API from "../api/axios"; 
import Header from "./Header";
import { ImagePlus, Trash2, Edit, ShoppingCart, FileText, X } from "lucide-react"; 
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

const SUBCATEGORIES = {
  Injectables: [
    "Toxins",
    "HA Fillers",
    "Skin Boosters",
    "Polynucleotides",
  ],
  Skincare: [
    "Skincare",
    "Hair",
    "Make Up",
  ],
};

const Products = () => {
  const { addToCart } = useCart();
  
  const [products, setProducts]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [selectedId, setSelectedId]           = useState(null); 
  const [addingToCart, setAddingToCart]       = useState(null); 
  const [selectedCategory, setSelectedCategory]       = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  
  const [imageFile, setImageFile]             = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [additionalImages, setAdditionalImages]   = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const categories = [
    "Botulinum Toxins",
    "Dermal Fillers",
    "Skin Boosters",
    "Fat Dissolvers",
    "Mesotherapy",
    "Anesthetics",
    "Skincare",
    "Consumables",
    "Injectables",
  ];

  const [formData, setFormData] = useState({
    name: "", brand: "", category: "Botulinum Toxins",
    subCategory: "",
    description: "", howToUse: "", safetyInfo: "",
    prescriptionRequired: false, unitPrice: "", dispensedBy: "",
    dosage: "", buyingPrice: "", sellingPrice: "", stock: "",
    expiryDate: "", sku: "", supplier: ""
  });

  const fetchProducts = async () => {
    try {
      const response = await API.get("/medicines"); 
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.medicines || []);
      setProducts(data);
    } catch (error) {
      console.error("error fetching products:", error);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Helper to find subcategory key reliably matching casing ────────────────
  const getSubcategoryKey = (catName) => {
    if (!catName) return null;
    return Object.keys(SUBCATEGORIES).find(
      (key) => key.toLowerCase() === catName.toLowerCase()
    );
  };

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === "all" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const subKey = getSubcategoryKey(selectedCategory);
    const hasSubcategories = subKey ? SUBCATEGORIES[subKey] : null;
    
    const matchSubCategory = !hasSubcategories ||
      selectedSubCategory === "all" ||
      (p.subCategory && p.subCategory.toLowerCase() === selectedSubCategory.toLowerCase());

    return matchCategory && matchSubCategory;
  });

  const handleAddToCart = async (product) => {
    if (!product._id) { toast.error("Invalid product."); return; }
    if (addingToCart === product._id) return;
    setAddingToCart(product._id);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add item to cart.");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleEdit = (product) => {
    setSelectedId(product._id);
    setFormData({
      name:                 product.name || "",
      brand:                product.brand || "",
      category:             product.category || "Botulinum Toxins",
      subCategory:          product.subCategory || "",
      description:          product.description || "",
      howToUse:             product.howToUse || "",
      safetyInfo:           product.safetyInfo || "",
      prescriptionRequired: product.prescriptionRequired || false,
      unitPrice:            product.unitPrice || product.sellingPrice || "",
      dispensedBy:          product.dispensedBy || "",
      dosage:               product.dosage || "",
      buyingPrice:          product.buyingPrice || "",
      sellingPrice:         product.sellingPrice || product.price || "",
      stock:                product.stock || "",
      expiryDate:           product.expiryDate ? product.expiryDate.split('T')[0] : "",
      sku:                  product.sku || "",
      supplier:             product.supplier || ""
    });

    if (product.image) setPreviewUrl(`http://localhost:4000/${product.image}`);

    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      setAdditionalPreviews(product.additionalImages.map(img => `http://localhost:4000/${img}`));
    } else {
      setAdditionalPreviews([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        await API.delete(`/medicines/${id}`);
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product removed from inventory");
      } catch (error) {
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Reset subCategory when category changes
    if (name === 'category') {
      setFormData({ ...formData, category: value, subCategory: '' });
      return;
    }
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleAdditionalFiles = (e) => {
    const files = Array.from(e.target.files);
    if (additionalPreviews.length + files.length > 3) {
      toast.error("Maximum 3 additional images allowed");
      return;
    }
    setAdditionalImages(prev => [...prev, ...files]);
    setAdditionalPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImages(prev => prev.filter((_, i) => i !== (index - (additionalPreviews.length - additionalImages.length))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Ensure accurate subcategory layout before transmission 
    const currentSubKey = getSubcategoryKey(formData.category);
    const finalSubCategory = currentSubKey ? formData.subCategory : "";

    Object.keys(formData).forEach(key => {
      if (key === "subCategory") {
        data.append("subCategory", finalSubCategory);
      } else {
        data.append(key, formData[key]);
      }
    });

    data.set("buyingPrice",  Number(formData.buyingPrice));
    data.set("sellingPrice", Number(formData.sellingPrice));
    data.set("price",        Number(formData.sellingPrice));
    data.set("stock",        Number(formData.stock));
    if (imageFile) data.append("image", imageFile);
    additionalImages.forEach(file => data.append("additionalImages", file));

    try {
      const token  = localStorage.getItem("token");
      const config = { headers: { "content-type": "multipart/form-data", "authorization": `bearer ${token}` } };

      if (selectedId) {
        const response = await API.put(`/medicines/${selectedId}`, data, config);
        const updated  = response.data.medicine || response.data;
        setProducts(products.map(p => p._id === selectedId ? updated : p));
        toast.success("Product updated successfully");
      } else {
        const response = await API.post("/medicines", data, config);
        const newProd  = response.data.medicine || response.data;
        setProducts(prev => [...prev, newProd]);
        toast.success("Product added to inventory");
      }
      closeModal();
    } catch (error) {
      const errorMsg = error.response?.status === 401
        ? "Unauthorized: please log in again."
        : "Error saving: check all fields.";
      toast.error(errorMsg);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setSelectedId(null);
    setImageFile(null); setPreviewUrl(null);
    setAdditionalImages([]); setAdditionalPreviews([]);
    setFormData({
      name: "", brand: "", category: "Botulinum Toxins", subCategory: "",
      description: "", howToUse: "", safetyInfo: "", prescriptionRequired: false,
      unitPrice: "", dispensedBy: "", dosage: "", buyingPrice: "",
      sellingPrice: "", stock: "", expiryDate: "", sku: "", supplier: ""
    });
  };

  const calculateMargin = () => {
    if (!formData.buyingPrice || !formData.sellingPrice) return 0;
    return (((formData.sellingPrice - formData.buyingPrice) / formData.sellingPrice) * 100).toFixed(1);
  };

  // ── Active subcategories based on selected category ───────────────────────
  const activeSubcategoryKey = getSubcategoryKey(selectedCategory);
  const activeSubcategories = activeSubcategoryKey ? SUBCATEGORIES[activeSubcategoryKey] : [];

  // Form modal contextual subcategories
  const formSubcategoryKey = getSubcategoryKey(formData.category);

  return (
    <div className="bg-white min-h-screen relative text-black">
      <Header title="Products" />
      <div className="p-8 max-w-[1600px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              💊 Inventory Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">{products.length} Active Medical Listings</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
            <span className="text-lg">+</span> Add New Product
          </button>
        </div>

        {/* ── Category Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <button onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${selectedCategory === "all" ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'}`}>
            All Items
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedSubCategory("all"); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── SubCategory Filters — shows for any category that has subcategories ── */}
        {activeSubcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button onClick={() => setSelectedSubCategory("all")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedSubCategory === "all" ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-500 border border-indigo-100 hover:bg-indigo-100'}`}>
              All {selectedCategory}
            </button>
            {activeSubcategories.map(sub => (
              <button key={sub} onClick={() => setSelectedSubCategory(sub)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedSubCategory === sub ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-500 border border-indigo-100 hover:bg-indigo-100'}`}>
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Pricing (GBP)</th>
                <th className="py-4 px-6">Margin</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 text-sm">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-slate-400 text-sm">No products found in this category.</td></tr>
              ) : filteredProducts.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                        {item.image
                          ? <img src={`http://localhost:4000/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-xl">📦</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-black text-sm">{item.name}</span>
                        <span className="text-xs text-slate-400">{item.sku || "no-sku"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium w-fit">{item.category}</span>
                      {item.subCategory && (
                        <span className="text-xs bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-lg font-medium w-fit">{item.subCategory}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Cost: £{item.buyingPrice || 0}</span>
                      <span className="text-sm font-semibold text-black">Sale: £{item.sellingPrice || item.price}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-semibold ${item.buyingPrice ? 'text-green-600' : 'text-slate-300'}`}>
                      {item.buyingPrice ? (((item.sellingPrice - item.buyingPrice) / item.sellingPrice) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${item.stock > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {item.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAddToCart(item)} disabled={addingToCart === item._id}
                        className={`p-2 rounded-lg transition-all ${addingToCart === item._id ? 'text-slate-300 cursor-not-allowed' : 'text-green-500 hover:bg-green-50'}`}>
                        {addingToCart === item._id ? <span className="text-xs">...</span> : <ShoppingCart size={16}/>}
                      </button>
                      <button onClick={() => handleEdit(item)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl p-8 shadow-2xl overflow-y-auto max-h-[95vh] text-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">
                {selectedId ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={closeModal} className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
              {/* Left column */}
              <div className="w-full lg:w-5/12 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 ml-1">Main Product Image</label>
                  <div onClick={() => document.getElementById('imageInput').click()}
                    className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:border-black transition-all group cursor-pointer overflow-hidden">
                    {previewUrl
                      ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                      : <div className="text-center">
                          <ImagePlus className="text-slate-300 group-hover:text-black transition-colors mb-2 mx-auto" size={40} />
                          <span className="text-xs font-medium text-slate-400">Click to upload image</span>
                        </div>}
                    <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 ml-1">Additional Images (max 3)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {additionalPreviews.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                        <img src={url} className="w-full h-full object-cover" alt={`preview ${idx}`} />
                        <button type="button" onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {additionalPreviews.length < 3 && (
                      <button type="button" onClick={() => document.getElementById('additionalImagesInput').click()}
                        className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:border-black transition-all text-slate-300 hover:text-black">
                        <ImagePlus size={20} />
                        <input id="additionalImagesInput" type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalFiles} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none transition-all min-h-[90px]" placeholder="Product details..."/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">How To Use</label>
                    <textarea name="howToUse" value={formData.howToUse} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none transition-all min-h-[70px]" placeholder="Usage instructions..."/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Safety & Warnings</label>
                    <textarea name="safetyInfo" value={formData.safetyInfo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-3 text-sm outline-none transition-all min-h-[70px]" placeholder="Safety warnings..."/>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="w-full lg:w-7/12 space-y-5">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Specifications</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Product Name</label>
                      <input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="e.g. Neuramis Deep"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">SKU</label>
                      <input name="sku" required value={formData.sku} onChange={handleChange} className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="BATCH-001"/>
                    </div>
                  </div>

                  {/* ── Category + SubCategory ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Category</label>
                      <select name="category" required value={formData.category} onChange={handleChange}
                        className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {/* ✅ SubCategory — reliably handles case checks */}
                    {formSubcategoryKey ? (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Sub Category</label>
                        <select name="subCategory" value={formData.subCategory} onChange={handleChange}
                          className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all">
                          <option value="">Select Subcategory</option>
                          {SUBCATEGORIES[formSubcategoryKey].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-5 pl-2">
                        <input type="checkbox" name="prescriptionRequired" id="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleChange} className="w-4 h-4 accent-black rounded cursor-pointer" />
                        <label htmlFor="prescriptionRequired" className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                          <FileText size={13} className="text-red-500" /> Prescription Required?
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Prescription checkbox when category has subcategories */}
                  {formSubcategoryKey && (
                    <div className="flex items-center gap-3 pl-1">
                      <input type="checkbox" name="prescriptionRequired" id="prescriptionRequired2" checked={formData.prescriptionRequired} onChange={handleChange} className="w-4 h-4 accent-black rounded cursor-pointer" />
                      <label htmlFor="prescriptionRequired2" className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                        <FileText size={13} className="text-red-500" /> Prescription Required?
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Unit Price (£)</label>
                      <input name="unitPrice" type="number" step="0.01" required value={formData.unitPrice} onChange={handleChange} className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Supplier</label>
                      <input name="supplier" required value={formData.supplier} onChange={handleChange} className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="Wholesaler name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Dispensed By</label>
                      <input name="dispensedBy" required value={formData.dispensedBy} onChange={handleChange} className="w-full bg-white border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="Pharmacist" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Brand / Manufacturer</label>
                    <input name="brand" required value={formData.brand} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="e.g. Hugel Pharma"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Expiry Date</label>
                    <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all"/>
                  </div>
                </div>

                {/* Financial */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Financial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Purchase (£)</label>
                      <input name="buyingPrice" type="number" step="0.01" required value={formData.buyingPrice} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Retail (£)</label>
                      <input name="sellingPrice" type="number" step="0.01" required value={formData.sellingPrice} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Est. Margin</label>
                      <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-green-600 text-center">{calculateMargin()}%</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Current Stock</label>
                    <input name="stock" type="number" required value={formData.stock} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="Units available" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Dosage / Strength</label>
                    <input name="dosage" value={formData.dosage} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-xl px-4 py-2.5 text-sm outline-none transition-all" placeholder="e.g. 100 units" />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-400 font-medium hover:text-slate-600 transition-all text-sm">Discard</button>
                  <button type="submit" className="flex-[2] py-3 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-slate-900 transition-all">
                    {selectedId ? "Save Changes" : "Add to Inventory"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;