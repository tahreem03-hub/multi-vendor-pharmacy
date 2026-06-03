import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPackage, 
  BiRefresh, 
  BiSearch, 
  BiShow
} from 'react-icons/bi';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_NEXT = {
  pending: 'verified',
  verified: 'dispensing',
  dispensing: 'dispatched',
  dispatched: 'delivered',
};

// High contrast action buttons
const STATUS_ACTION = {
  pending:    { label: 'verify rx',    cls: 'bg-black text-white hover:bg-gray-800' },
  verified:   { label: 'dispense',     cls: 'bg-black text-white hover:bg-gray-800' },
  dispensing: { label: 'dispatch',     cls: 'bg-black text-white hover:bg-gray-800' },
  dispatched: { label: 'delivered',    cls: 'bg-emerald-600 text-white hover:bg-emerald-700' },
};

const STATUS_THEME = {
  pending:    'bg-gray-100 text-gray-700 border-gray-200',
  verified:   'bg-gray-100 text-gray-700 border-gray-200',
  dispensing: 'bg-gray-100 text-gray-700 border-gray-200',
  dispatched: 'bg-gray-100 text-gray-700 border-gray-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled:  'bg-red-50 text-red-700 border-red-100',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const LIMIT = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: LIMIT, page });
      if (statusFilter) params.append('status', statusFilter);
      // Fetches standard order flow
      const { data } = await API.get(`/orders/admin/all?${params}`);
      setOrders(data.orders || []);
      setTotal(data.count || 0);
    } catch (err) {
      toast.error('failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      toast.success(`order ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('update failed');
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-black">
      <Header title="order side" />
      
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="w-1.5 h-7 bg-black rounded-full" />
               <h1 className="text-2xl font-black tracking-tight text-black">orders explorer</h1>
            </div>
            <p className="text-[11px] font-bold text-gray-500 ml-4">
              pipeline capacity: <span className="text-black">{total} active units</span>
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all active:scale-95 group"
          >
            <BiRefresh size={20} className={`${loading ? 'animate-spin' : ''} text-black group-hover:rotate-180 transition-transform`} />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-2 mb-6 flex flex-col md:flex-row gap-2 shadow-sm">
          <div className="relative flex-1">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="search by id or customer name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-lg pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-200 transition-all outline-none text-black"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border border-gray-200 rounded-lg px-6 py-2 text-xs font-bold text-black outline-none cursor-pointer hover:bg-gray-50"
          >
            <option value="">all transactions</option>
            {['pending', 'verified', 'dispensing', 'dispatched', 'delivered'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[12px] font-black text-gray-600">
                <th className="py-4 px-6 text-left">ref id</th>
                <th className="py-4 px-6 text-left">customer</th>
                <th className="py-4 px-6 text-left">revenue</th>
                <th className="py-4 px-6 text-center">pipeline</th>
                <th className="py-4 px-6 text-right">actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-[10px] font-bold text-gray-400">syncing records...</td></tr>
              ) : orders.map((order) => {
                const nextStatus = STATUS_NEXT[order.status];
                const action = STATUS_ACTION[order.status];
                const isExp = expanded === order._id;

                return (
                  <React.Fragment key={order._id}>
                    <tr className={`group transition-all ${isExp ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="py-5 px-6 font-mono text-[11px] font-bold text-gray-500">{order._id?.slice(-8).toUpperCase()}</td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-black text-sm">{order.customer?.firstName} {order.customer?.lastName}</span>
                          <span className="text-[11px] font-bold text-gray-400">verified account</span>
                        </div>
                      </td>
                      <td className="py-5 px-6"><span className="text-sm font-black text-black">{fmt(order.financials?.revenueExVat)}</span></td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[9px] font-black ${STATUS_THEME[order.status]}`}>
                           {order.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {action && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              className={`px-4 py-2 rounded text-[10px] font-black transition-all shadow-sm active:scale-95 border border-transparent ${action.cls}`}
                            >
                              {action.label}
                            </button>
                          )}
                          <button
                            onClick={() => setExpanded(isExp ? null : order._id)}
                            className={`p-2 rounded-lg transition-colors border ${isExp ? 'bg-black border-black text-white' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
                          >
                            <BiShow size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExp && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={5} className="p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-3">
                              <h3 className="text-[12px] font-black text-black flex items-center gap-2 mb-4">
                                <BiPackage size={14} className="text-black"/> package manifest
                              </h3>
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 bg-gray-100 rounded text-black flex items-center justify-center font-black text-[10px]">{item.quantity}x</div>
                                      <span className="text-xs font-bold text-gray-800">{item.productName}</span>
                                  </div>
                                  <span className="font-mono text-xs font-bold text-black">{fmt(item.unitRevenueExVat * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 ">
                               <h3 className="text-[10px] font-black text-gray-500 mb-6">financial balance</h3>
                               <div className="space-y-3 mb-6">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-500">tax (vat)</span>
                                    <span className="text-black font-bold">{fmt(order.financials?.outputVat)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-500">shipping</span>
                                    <span className="text-black">£0.00</span>
                                  </div>
                               </div>
                               <div className="pt-4 border-t border-dashed border-gray-200">
                                  <p className="text-[9px] text-gray-500 font-black mb-1">net commission</p>
                                  <p className="text-2xl font-black text-black leading-none">{fmt(order.financials?.commissionExVat)}</p>
                               </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;