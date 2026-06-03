import { useState, useEffect } from 'react';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusColors = {
  delivered:  { label: 'paid',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  dispatched: { label: 'sent',    cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  pending:    { label: 'pending',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  cancelled:  { label: 'void',    cls: 'bg-rose-50 text-rose-700 border-rose-100' },
  default:    { label: 'draft',    cls: 'bg-slate-50 text-slate-700 border-slate-100' },
};

const Invoices = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/admin/all');
        setOrders(data.orders || []);
      } catch (err) {
        toast.error('failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const invoices = orders.map((order, idx) => {
    const revenueExVat = order.financials?.revenueExVat || 0;
    const vatAmount    = order.financials?.outputVat    || 0;
    const totalIncVat  = revenueExVat + vatAmount;
    const status       = statusColors[order.status] || statusColors.default;

    return {
      id:         `inv-${String(idx + 1).padStart(4, '0')}`,
      customer:   `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || '—',
      email:      order.customer?.email || '—',
      orderRef:   order._id?.slice(-8).toUpperCase(),
      amount:     revenueExVat,
      vat:        vatAmount,
      total:      totalIncVat,
      date:       new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status,
    };
  });

  const filtered = invoices.filter(inv => 
    inv.customer.toLowerCase().includes(search.toLowerCase()) || 
    inv.id.toLowerCase().includes(search.toLowerCase())
  );

  // Added export functionality
  const handleExport = (inv) => {
    const csvContent = [
      ["Invoice ID", "Customer", "Date", "VAT", "Total", "Status"],
      [inv.id, inv.customer, inv.date, inv.vat, inv.total, inv.status.label]
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.csv`;
    a.click();
    toast.success('invoice exported');
  };

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalVat      = invoices.reduce((s, i) => s + i.vat,   0);

  return (
    <div className="bg-white min-h-screen text-black">
      <Header title="Invoices" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold border-b border-slate-100 pb-2 inline-block">Invoice Registry</h1>
          <p className="text-slate-500 text-xs mt-1">Manage and Export System-Generated Invoices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'total volume', value: fmt(totalInvoiced) },
            { label: 'vat collected', value: fmt(totalVat) },
            { label: 'active count', value: invoices.length },
          ].map((stat, i) => (
            <div key={i} className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="filter by customer or id..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-black bg-white placeholder:text-slate-400"
          />
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">invoice</th>
                    <th className="py-3 px-4">customer</th>
                    <th className="py-3 px-4 text-right">vat</th>
                    <th className="py-3 px-4 text-right">total</th>
                    <th className="py-3 px-4">date</th>
                    <th className="py-3 px-4 text-center">status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-black">{inv.id}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">{inv.customer}</div>
                        <div className="text-[10px] text-slate-400">ord-{inv.orderRef}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{fmt(inv.vat)}</td>
                      <td className="py-3 px-4 text-right font-bold text-black">{fmt(inv.total)}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{inv.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${inv.status.cls}`}>
                            {inv.status.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => handleExport(inv)}
                          className="text-slate-300 hover:text-black transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <p className="text-[10px] text-slate-400 mt-4 font-medium tracking-widest">
          {filtered.length} invoices found
        </p>
      </div>
    </div>
  );
};

export default Invoices;