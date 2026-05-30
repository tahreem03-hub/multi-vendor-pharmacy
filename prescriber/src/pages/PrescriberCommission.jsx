import { useState, useEffect } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PrescriberCommission = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my-commission')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Earned',   value: fmt(data?.totalCommission),   accent: 'border-l-slate-500' },
    { label: 'This Month',     value: fmt(data?.monthlyCommission),  accent: 'border-l-green-400' },
    { label: 'Pending Payout', value: fmt(data?.pendingCommission),  accent: 'border-l-amber-400' },
    { label: 'Total Orders',   value: data?.totalOrders || 0,        accent: 'border-l-blue-400'  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Commission" />
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 ${s.accent}`}>
              <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <TrendingUp size={14} className="text-slate-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Payout History</h2>
          </div>

          {(!data?.payouts || data.payouts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <TrendingUp size={24} className="text-slate-200" />
              <p className="text-xs text-slate-400 font-medium">No payout history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Period', 'Invoice', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {h}
                      </th>
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
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wide">
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