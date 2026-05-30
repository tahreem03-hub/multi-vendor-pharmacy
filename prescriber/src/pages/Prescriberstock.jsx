import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, TrendingDown } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const PrescriberStock = () => {
  const [stock,   setStock]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    API.get('/stock/my-stock')
      .then(res => setStock(Array.isArray(res.data) ? res.data : res.data.stock || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = stock.filter(item => {
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'low'      ? item.stock <= 5 && item.stock > 0 :
      filter === 'out'      ? item.stock === 0 :
      filter === 'expired'  ? (item.expiryDate && new Date(item.expiryDate) < new Date()) :
      true;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: 'Total Products', value: stock.length,                                              color: 'border-l-slate-400' },
    { label: 'Low Stock',      value: stock.filter(i => i.stock <= 5 && i.stock > 0).length,    color: 'border-l-amber-400' },
    { label: 'Out of Stock',   value: stock.filter(i => i.stock === 0).length,                   color: 'border-l-red-400'   },
    { label: 'Total Units',    value: stock.reduce((a, i) => a + (i.stock || 0), 0),             color: 'border-l-green-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="My Stock" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 border-l-4 ${s.color}`}>
              <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'low', 'out', 'expired'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Expiry</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-16">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16">
                  <Package size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No products found</p>
                </td></tr>
              ) : filtered.map(item => {
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                const isLow     = item.stock <= 5 && item.stock > 0;
                const isOut     = item.stock === 0;
                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image
                            ? <img src={`http://localhost:4000/${item.image}`} className="w-full h-full object-cover" alt="" />
                            : <Package size={14} className="text-slate-300" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                        {item.category || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(isLow || isOut) && <TrendingDown size={13} className={isOut ? 'text-red-400' : 'text-amber-400'} />}
                        <span className="text-sm font-semibold text-slate-700">{item.stock}</span>
                        <span className="text-xs text-slate-400">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isOut     ? 'bg-red-50 text-red-500 border-red-200' :
                        isExpired ? 'bg-red-50 text-red-500 border-red-200' :
                        isLow     ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                    'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {isOut ? 'Out' : isExpired ? 'Expired' : isLow ? 'Low' : 'Good'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrescriberStock;