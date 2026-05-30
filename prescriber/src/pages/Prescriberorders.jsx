import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Search } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const statusConfig = {
  pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-600 border-amber-200',   icon: Clock        },
  verified:   { label: 'Verified',   color: 'bg-blue-50 text-blue-600 border-blue-200',      icon: CheckCircle  },
  dispensing: { label: 'Dispensing', color: 'bg-purple-50 text-purple-600 border-purple-200',icon: Package      },
  dispatched: { label: 'Dispatched', color: 'bg-cyan-50 text-cyan-600 border-cyan-200',      icon: Truck        },
  delivered:  { label: 'Delivered',  color: 'bg-green-50 text-green-600 border-green-200',   icon: CheckCircle  },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-500 border-red-200',         icon: XCircle      },
};

const fmt = (n) => `£${parseFloat(n || 0).toFixed(2)}`;

const PrescriberOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    API.get('/orders/my-orders')
      .then(res => setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['all', 'pending', 'verified', 'dispensing', 'dispatched', 'delivered', 'cancelled'];

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o._id?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="My Orders" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search by order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                  filter === s ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
              <Package size={20} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg   = statusConfig[order.status] || statusConfig.pending;
              const Icon  = cfg.icon;
              const total = order.items?.reduce((a, i) => a + ((i.price || 0) * (i.quantity || 1)), 0) || 0;
              return (
                <div key={order._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 font-mono">
                          #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-bold text-slate-800">{fmt(total)}</p>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-medium">
                            {item.name || item.medicineId?.name || 'Item'}
                            <span className="text-slate-400 ml-1">×{item.quantity}</span>
                          </span>
                          <span className="text-slate-700 font-semibold">
                            {fmt((item.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-slate-400">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                  )}

                  {/* Delivery address */}
                  {order.deliveryAddress && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Delivery
                      </p>
                      <p className="text-xs text-slate-500">
                        {[order.deliveryAddress.line1, order.deliveryAddress.city, order.deliveryAddress.postcode]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriberOrders;