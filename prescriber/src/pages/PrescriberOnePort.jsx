import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Package, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const PrescriberOnePort = () => {
  const [port, setPort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    API.get('/port/my')
      .then(res => setPort(res.data))
      .catch(err => console.error('Failed to load port:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading OnePort data...</p>
      </div>
    </div>
  );

  if (!port) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">No OnePort records found</p>
        <p className="text-xs text-slate-400 mt-1">Contact support if this persists</p>
      </div>
    </div>
  );

  const statusConfig = {
    green:  { label: 'Operational', color: 'emerald' },
    amber:  { label: 'Caution',     color: 'amber' },
    red:    { label: 'Action Req.', color: 'red' },
  };
  const status = statusConfig[port.equilibriumStatus] || { label: 'Check Required', color: 'slate' };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased">
      <PrescriberHeader title="OnePort Financial Hub" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* ── Status Banner ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
              <TrendingUp size={17} className="text-slate-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full bg-${status.color}-400 animate-pulse`} />
                <p className="text-sm font-semibold text-slate-700">{status.label}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OnePort Balance</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight mt-0.5">
                {fmt(port.availableToSpend)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Key Balances Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Available to Spend', value: port.availableToSpend, icon: <Wallet size={18} />, color: 'emerald' },
            { label: 'Cash Balance', value: port.cashBalance, icon: <Package size={18} />, color: 'blue' },
            { label: 'Stock Value', value: port.stockValue, icon: <Package size={18} />, color: 'amber' },
            { label: 'Earned Profit', value: port.earnedProfit, icon: <TrendingUp size={18} />, color: 'green' },
          ].map((item, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-${item.color}-400`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{fmt(item.value)}</p>
                </div>
                <div className={`w-10 h-10 bg-${item.color}-50 rounded-xl border border-${item.color}-200 flex items-center justify-center text-${item.color}-600`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── VAT Status ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <AlertCircle size={14} className="text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">VAT Period</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Input VAT', 'Output VAT', 'Net Position', 'Status'].map((label, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-lg font-semibold text-slate-800 mt-1 capitalize">
                  {i === 0 ? fmt(port.currentVatPeriod?.inputVat) : 
                   i === 1 ? fmt(port.currentVatPeriod?.outputVat) : 
                   i === 2 ? fmt(port.currentVatPeriod?.netVatPosition) : 
                   (port.currentVatPeriod?.status || 'open')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Commission Payout History ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <TrendingUp size={14} className="text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Commission Payout History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Period</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Invoice #</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Amount (ex VAT)</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {port.commissionPayouts?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{p.month}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.invoiceNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{fmt(p.amountExVat)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        {p.status?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriberOnePort;