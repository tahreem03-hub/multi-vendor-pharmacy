import { BiCheckCircle, BiWallet, BiPackage, BiTrendingUp, BiInfoCircle } from 'react-icons/bi';
import { MdTrendingUp } from 'react-icons/md';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { useMyThreePot } from '../hooks/usePrescriberData';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const PrescriberThreePot = () => {
  const { data: pot, loading } = useMyThreePot();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading financial data...</p>
      </div>
    </div>
  );

  if (!pot) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">No financial records found</p>
        <p className="text-xs text-slate-400 mt-1">Contact support if this persists</p>
      </div>
    </div>
  );

  const equilibriumLabel = {
    green: '✓ Equilibrium',
    amber: '⚠ Near Limit',
    red:   '✗ Breach',
  }[pot.equilibriumStatus] || 'Check Required';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased">
      <PrescriberHeader title="Financial Insights" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* ── Status Banner ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
              <MdTrendingUp size={17} className="text-slate-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${
                  pot.equilibriumStatus === 'green' ? 'bg-emerald-400' :
                  pot.equilibriumStatus === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                } animate-pulse`} />
                <p className="text-sm font-semibold text-slate-700">Operational</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Commission</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight mt-0.5">
                {fmt(pot.pot3?.commissionSubAccount)}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              pot.equilibriumStatus === 'green'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : pot.equilibriumStatus === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {equilibriumLabel}
            </span>
          </div>
        </div>

        {/* ── Three Pot Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Pot 1 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-slate-400">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <BiPackage size={17} className="text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  POT 01
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-2">Stock Account</p>
              <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                {fmt(pot.pot1?.stockValueExVat)}
              </p>
              <p className="text-xs text-slate-400 mt-1">ex VAT</p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Sync</span>
              <span className="text-[10px] font-semibold text-slate-600">
                {pot.pot1?.lastSyncedAt
                  ? new Date(pot.pot1.lastSyncedAt).toLocaleDateString('en-GB')
                  : '—'}
              </span>
            </div>
          </div>

          {/* Pot 2 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-slate-500">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <BiWallet size={17} className="text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  POT 02
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-2">Security Deposit</p>
              <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                {fmt(pot.pot2?.depositAmount)}
              </p>
              <p className="text-xs text-slate-400 mt-1">held in escrow</p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref</span>
              <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[120px] uppercase">
                {pot.pot2?.depositPaidBy || 'Internal'}
              </span>
            </div>
          </div>

          {/* Pot 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-slate-600">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <BiTrendingUp size={17} className="text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  POT 03
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-2">Sales Revenue</p>
              <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                {fmt(pot.pot3?.totalRevenueExVat)}
              </p>
              <p className="text-xs text-slate-400 mt-1">ex VAT</p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified</span>
              <BiCheckCircle size={14} className="text-slate-500" />
            </div>
          </div>
        </div>

        {/* ── Equilibrium Progress ── */}
        {pot.pot2?.depositAmount > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Pot 1 vs Pot 2 Usage</p>
                <p className="text-xs text-slate-400 mt-0.5">Stock value as a percentage of your security deposit</p>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {((pot.pot1?.stockValueExVat / pot.pot2?.depositAmount) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  pot.equilibriumStatus === 'green' ? 'bg-slate-500' :
                  pot.equilibriumStatus === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min((pot.pot1?.stockValueExVat / pot.pot2?.depositAmount) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-400 font-medium">£0</span>
              <span className="text-[10px] text-slate-400 font-medium">
                Deposit limit: {fmt(pot.pot2?.depositAmount)}
              </span>
            </div>
          </div>
        )}

        {/* ── Payout History ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <BiTrendingUp size={14} className="text-slate-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">Commission Payout History</h4>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {pot.commissionPayouts?.length || 0} records
            </span>
          </div>

          {(!pot.commissionPayouts || pot.commissionPayouts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                <BiTrendingUp size={18} className="text-slate-300" />
              </div>
              <p className="text-xs text-slate-400 font-medium">No historical data available</p>
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
                  {pot.commissionPayouts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{p.month}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.invoiceNumber || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{fmt(p.amountExVat)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider">
                          {p.status?.replace('_', ' ')}
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

export default PrescriberThreePot;