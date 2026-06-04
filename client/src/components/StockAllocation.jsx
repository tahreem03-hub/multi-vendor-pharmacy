import { useState, useEffect } from 'react';
import API from '../api/axios';
import Header from './Header';
import toast from 'react-hot-toast';
import { Package, Send, Search, ChevronDown, AlertCircle } from 'lucide-react';

const StockAllocation = () => {
  const [prescribers, setPrescribers]   = useState([]);
  const [medicines,   setMedicines]     = useState([]);
  const [allStock,    setAllStock]      = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [submitting,  setSubmitting]    = useState(false);
  const [medSearch,   setMedSearch]     = useState('');
  const [presSearch,  setPresSearch]    = useState('');
  const [activeTab,   setActiveTab]     = useState('allocate');

  const [form, setForm] = useState({
    prescriberId: '',
    product: '',
    productName: '',
    quantity: '',
    costPriceExVat: '',
    sellingPriceExVat: '',
    expiryDate: '',
    isPOM: false,
    batchNumber: '',
    storageLocation: '',
    requiresColdChain: false,
    lowStockThreshold: 5,
  });

  useEffect(() => {
    Promise.all([
      API.get('/users?role=prescriber').catch(() => ({ data: [] })),
      API.get('/medicines').catch(() => ({ data: [] })),
      API.get('/stock/admin/all').catch(() => ({ data: [] })),
    ]).then(([presRes, medRes, stockRes]) => {
      const pres = Array.isArray(presRes.data) ? presRes.data : (presRes.data.users || presRes.data.prescribers || []);
      const meds = Array.isArray(medRes.data)  ? medRes.data  : (medRes.data.medicines  || []);
      const stk  = Array.isArray(stockRes.data) ? stockRes.data : (stockRes.data.stock  || []);
      setPrescribers(pres.filter(u => u.role?.toLowerCase() === 'prescriber'));
      setMedicines(meds);
      setAllStock(stk);
    }).finally(() => setLoading(false));
  }, []);

  const filteredMeds = medicines.filter(m =>
    !medSearch || m.name.toLowerCase().includes(medSearch.toLowerCase()) || m.brand.toLowerCase().includes(medSearch.toLowerCase())
  );
  const filteredPres = prescribers.filter(p =>
    !presSearch || `${p.firstName} ${p.lastName} ${p.prescriberId || ''}`.toLowerCase().includes(presSearch.toLowerCase())
  );

  const handleSelectMedicine = (med) => {
    setForm(f => ({
      ...f,
      product: med._id,
      productName: med.name,
      costPriceExVat: med.buyingPrice || '',
      sellingPriceExVat: med.sellingPrice || med.price || '',
    }));
    setMedSearch(med.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prescriberId || !form.product || !form.quantity || !form.expiryDate) {
      toast.error('Fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/stock/admin/add', {
        ...form,
        quantity: Number(form.quantity),
        costPriceExVat: Number(form.costPriceExVat),
        sellingPriceExVat: Number(form.sellingPriceExVat),
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
      });
      toast.success('Stock allocated successfully!');
      setForm({
        prescriberId: '', product: '', productName: '',
        quantity: '', costPriceExVat: '', sellingPriceExVat: '',
        expiryDate: '', isPOM: false, batchNumber: '', storageLocation: '',
        requiresColdChain: false, lowStockThreshold: 5,
      });
      setMedSearch('');
      // Refresh stock
      const res = await API.get('/stock/admin/all').catch(() => ({ data: [] }));
      setAllStock(Array.isArray(res.data) ? res.data : (res.data.stock || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate stock');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPrescriber = prescribers.find(p => p.prescriberId === form.prescriberId);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header title="Stock Allocation" />

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
          {[['allocate', 'Allocate Stock'], ['view', 'View All Stock']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── ALLOCATE TAB ── */}
        {activeTab === 'allocate' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Prescriber + Medicine */}
            <div className="space-y-4">

              {/* Select Prescriber */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">1. Select Prescriber *</p>
                <input
                  type="text"
                  placeholder="Search prescribers…"
                  value={presSearch}
                  onChange={e => setPresSearch(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400 mb-3"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredPres.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No prescribers found</p>
                  )}
                  {filteredPres.map(p => (
                    <button
                      type="button"
                      key={p._id}
                      onClick={() => { setForm(f => ({ ...f, prescriberId: p.prescriberId || p._id })); setPresSearch(`${p.firstName} ${p.lastName}`); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${form.prescriberId === (p.prescriberId || p._id) ? 'bg-black text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span className="font-medium">{p.firstName} {p.lastName}</span>
                      <span className="ml-2 text-xs opacity-60">{p.prescriberId}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Medicine */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">2. Select Medicine *</p>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search medicines…"
                    value={medSearch}
                    onChange={e => { setMedSearch(e.target.value); setForm(f => ({ ...f, product: '', productName: '' })); }}
                    className="w-full pl-9 pr-4 text-sm border border-slate-200 rounded-xl py-2 outline-none focus:border-slate-400"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1">
                  {filteredMeds.slice(0, 12).map(m => (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => handleSelectMedicine(m)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${form.product === m._id ? 'bg-black text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="ml-2 text-xs opacity-60">{m.brand} · {m.category}</span>
                      {m.prescriptionRequired && (
                        <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">POM</span>
                      )}
                    </button>
                  ))}
                  {filteredMeds.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No medicines found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Allocation details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">3. Allocation Details</p>

              {form.product && form.prescriberId && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                  Allocating <strong>{form.productName}</strong> → <strong>{selectedPrescriber ? `${selectedPrescriber.firstName} ${selectedPrescriber.lastName}` : form.prescriberId}</strong>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Quantity *</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Expiry Date *</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Cost Price (ex VAT) £</label>
                  <input type="number" step="0.01" value={form.costPriceExVat} onChange={e => setForm(f => ({ ...f, costPriceExVat: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Selling Price (ex VAT) £</label>
                  <input type="number" step="0.01" value={form.sellingPriceExVat} onChange={e => setForm(f => ({ ...f, sellingPriceExVat: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Batch Number</label>
                  <input type="text" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Low Stock Threshold</label>
                  <input type="number" min="1" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Storage Location</label>
                <input type="text" value={form.storageLocation} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400" placeholder="e.g. Fridge A, Shelf 3" />
              </div>

              <div className="flex gap-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isPOM} onChange={e => setForm(f => ({ ...f, isPOM: e.target.checked }))}
                    className="w-4 h-4 accent-black" />
                  <span className="text-slate-700 font-medium">POM (Prescription Only)</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.requiresColdChain} onChange={e => setForm(f => ({ ...f, requiresColdChain: e.target.checked }))}
                    className="w-4 h-4 accent-black" />
                  <span className="text-slate-700 font-medium">Cold Chain Required</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !form.prescriberId || !form.product}
                className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Send size={15} />
                {submitting ? 'Allocating…' : 'Allocate Stock to Prescriber'}
              </button>
            </div>
          </form>
        )}

        {/* ── VIEW ALL STOCK TAB ── */}
        {activeTab === 'view' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Package size={16} className="text-slate-500" />
              <span className="text-sm font-bold text-slate-700">All Allocated Stock ({allStock.length})</span>
            </div>
            {allStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Package size={36} className="mb-3 opacity-30" />
                <p className="text-sm">No stock allocated yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Medicine', 'Prescriber', 'Qty', 'Cost (ex VAT)', 'Sell (ex VAT)', 'Expiry', 'POM', 'Low Stock'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allStock.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.prescriber?.firstName ? `${item.prescriber.firstName} ${item.prescriber.lastName}` : item.prescriberId}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${item.isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                            {item.quantityAvailable}
                          </span>
                          {item.isLowStock && <AlertCircle size={12} className="inline ml-1 text-amber-500" />}
                        </td>
                        <td className="px-4 py-3 text-slate-600">£{item.costPriceExVat?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-600">£{item.sellingPriceExVat?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : '—'}
                          {item.expiryAlert !== 'none' && (
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.expiryAlert === 'expired' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              {item.expiryAlert.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{item.isPOM ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">POM</span> : '—'}</td>
                        <td className="px-4 py-3">{item.isLowStock ? <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-xs font-bold">Low</span> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAllocation;
