import { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, ArrowUpRight } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PrescriberCommission = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my-commission')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load commission:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Earned', value: fmt(data?.totalCommission), icon: Award, accent: 'border-l-slate-400' },
    { label: 'This Month', value: fmt(data?.monthlyCommission), icon: TrendingUp, accent: 'border-l-emerald-400' },
    { label: 'Pending Payout', value: fmt(data?.pendingCommission), icon: Clock, accent: 'border-l-amber-400' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: ArrowUpRight, accent: 'border-l-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Commission Hub" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 ${s.accent}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{s.value}</p>
                </div>
                <s.icon size={16} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                <TrendingUp size={14} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Recent Payouts</h2>
            </div>
          </div>

          {(!data?.payouts || data.payouts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                <TrendingUp size={20} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No payout history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Period', 'Invoice #', 'Amount (ex VAT)', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.payouts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{p.month}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.invoiceNumber || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{fmt(p.amountExVat)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                          p.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {p.status?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriberCommission;