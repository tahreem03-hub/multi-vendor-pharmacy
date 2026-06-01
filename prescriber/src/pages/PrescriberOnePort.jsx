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
        <p className="text-xs text-slate-400 font-medium">Loading financial data...</p>
      </div>
    </div>
  );

  if (!port) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">No financial records found</p>
        <p className="text-xs text-slate-400 mt-1">Contact support if this persists</p>
      </div>
    </div>
  );

  const equilibriumLabel = {
    green: '✓ Healthy',
    amber: '⚠ Caution',
    red:   '✗ Alert',
  }[port.equilibriumStatus] || 'Check Required';

  const subBalances = [
    { label: 'Cash Balance',        value: port.cashBalance,           icon: '💰' },
    { label: 'Stock Value',         value: port.stockValue,            icon: '📦' },
    { label: 'Earned Profit',       value: port.earnedProfit,          icon: '📈' },
    { label: 'VAT Position',        value: port.vatPosition,           icon: '🧾' },
    { label: 'Available to Spend',  value: port.availableToSpend,      icon: '✓' },
  ];

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
                <span className={`w-2 h-2 rounded-full ${
                  port.equilibriumStatus === 'green' ? 'bg-emerald-400' :
                  port.equilibriumStatus === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                } animate-pulse`} />
                <p className="text-sm font-semibold text-slate-700">
                  {port.equilibriumStatus === 'green' ? 'Operational' : port.equilibriumStatus === 'amber' ? 'Caution' : 'Alert Required'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">True Pot Value</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight mt-0.5">
                {fmt(port.truePotValue)}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              port.equilibriumStatus === 'green'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : port.equilibriumStatus === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {equilibriumLabel}
            </span>
          </div>
        </div>

        {/* ── Key Balances ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available to Spend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-emerald-400">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available to Spend</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">
                  {fmt(port.availableToSpend)}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center">
                <Wallet size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">After VAT & commitments</p>
          </div>

          {/* Cash Balance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-blue-400">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cash Balance</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">
                  {fmt(port.cashBalance)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center">
                <Package size={18} className="text-blue-600" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Liquid funds</p>
          </div>

          {/* Stock Value */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Value</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">
                  {fmt(port.stockValue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center">
                <Package size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Medicines held</p>
          </div>

          {/* Earned Profit */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-green-400">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Earned Profit</p>
                <p className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">
                  {fmt(port.earnedProfit)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl border border-green-200 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Commission accrued</p>
          </div>
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
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Input VAT</p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {fmt(port.currentVatPeriod?.inputVat || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Output VAT</p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {fmt(port.currentVatPeriod?.outputVat || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Net Position</p>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {fmt(port.currentVatPeriod?.netVatPosition || 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <p className="text-xs font-semibold text-slate-700 mt-1 capitalize">
                {port.currentVatPeriod?.status || 'open'}
              </p>
            </div>
          </div>
        </div>

        {/* ── All Sub-Balances (Detailed View) ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">All Sub-Balances</h3>
            <button onClick={() => setShowDetails(!showDetails)}
              className="text-slate-400 hover:text-slate-600 transition-colors">
              {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subBalances.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{fmt(item.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Restricted VAT Payable</span>
                <span className="text-sm font-semibold text-slate-800">{fmt(port.restrictedVatPayable)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Working Float</span>
                <span className="text-sm font-semibold text-slate-800">{fmt(port.workingFloat)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Alerts ── */}
        {port.alerts && port.alerts.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
              <AlertCircle size={16} className="text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-700">Active Alerts</h3>
              <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                {port.alerts.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {port.alerts.map((alert, idx) => (
                <div key={idx} className="p-4 flex items-start gap-3 hover:bg-slate-50/50">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{alert.type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Commission Payout History ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <TrendingUp size={14} className="text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Commission Payout History</h3>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {port.commissionPayouts?.length || 0} records
            </span>
          </div>

          {(!port.commissionPayouts || port.commissionPayouts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <CheckCircle size={20} className="text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">No payout history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Billing Period</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Invoice #</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">Amount (ex VAT)</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {port.commissionPayouts.map((p, idx) => (
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
          )}
        </div>

      </div>
    </div>
  );
};

export default PrescriberOnePort;
