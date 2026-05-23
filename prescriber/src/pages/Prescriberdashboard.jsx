import { BiCheck } from 'react-icons/bi';
import { 
  MdTrendingUp, 
  MdWarning, 
  MdInventory, 
  MdAttachMoney, 
  MdPercent, 
  MdOutlineLayers, 
  MdNotificationsNone,
  MdHistory
} from 'react-icons/md';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { usePrescriberDashboard } from '../hooks/usePrescriberData';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const statusBadge = {
  pending:    'bg-slate-50 text-slate-600 border border-slate-200',
  verified:   'bg-slate-50 text-slate-600 border border-slate-200',
  dispensing: 'bg-slate-50 text-slate-600 border border-slate-200',
  dispatched: 'bg-slate-50 text-slate-600 border border-slate-200',
  delivered:  'bg-slate-50 text-slate-600 border border-slate-200',
  cancelled:  'bg-slate-50 text-slate-600 border border-slate-200',
};

const PrescriberDashboard = () => {
  const { data, loading, error } = usePrescriberDashboard();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">Something went wrong</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
      </div>
    </div>
  );

  const threePot = data?.threePot || {};
  const orders   = data?.orders   || {};
  const stock    = data?.stock    || {};
  const alerts   = data?.alerts   || { count: 0, items: [] };
  const recentPrescriptions = data?.recentPrescriptions || [];

  const stats = [
    {
      icon: <MdAttachMoney size={22} />,
      value: fmt(orders.totalRevenue),
      label: 'Total Revenue',
      sub: `${orders.totalOrders || 0} orders total`,
      accent: 'border-l-slate-400',
    },
    {
      icon: <MdPercent size={22} />,
      value: fmt(orders.totalCommission),
      label: 'My Commission',
      sub: `${orders.pendingOrders || 0} pending`,
      accent: 'border-l-slate-400',
    },
    {
      icon: <MdOutlineLayers size={22} />,
      value: stock.totalProducts || 0,
      label: 'Stock Products',
      sub: `${stock.totalUnits || 0} units available`,
      accent: 'border-l-slate-400',
    },
    {
      icon: <MdNotificationsNone size={22} />,
      value: alerts.count || 0,
      label: 'Unread Alerts',
      sub: alerts.count > 0 ? 'Action required' : 'All clear',
      accent: alerts.count > 0 ? 'border-l-red-300' : 'border-l-slate-400',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700 antialiased">
      <PrescriberHeader title="Dashboard" alertCount={alerts.count || 0} />

      <div className="p-5 md:p-8 max-w-[1400px] mx-auto space-y-6">

        {/* ── Alert Banner ── */}
        {threePot.equilibriumStatus === 'red' && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <MdWarning className="text-slate-700" size={16} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Pot 1 stock value exceeds your Pot 2 deposit — contact Time Pharmacy immediately.
            </p>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 ${stat.accent} hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                  {stat.icon}
                </div>
                <span className="text-xs font-medium text-slate-400">{stat.sub}</span>
              </div>
              <p className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Prescriptions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdHistory size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Recent Prescriptions</h2>
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {recentPrescriptions.length} records
              </span>
            </div>

            {recentPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <MdHistory size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No prescriptions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 py-3">Patient</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentPrescriptions.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-700 truncate max-w-[180px]">
                          {p.patientDetails?.firstName || p.user?.firstName}{' '}
                          {p.patientDetails?.lastName  || p.user?.lastName}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge[p.status] || 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdNotificationsNone size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Alerts</h2>
              {alerts.count > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {alerts.count} new
                </span>
              )}
            </div>

            {alerts.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <MdNotificationsNone size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No active alerts</p>
              </div>
            ) : (
              <div className="p-4 space-y-2 max-h-[220px] overflow-y-auto">
                {alerts.items.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MdWarning className="shrink-0 mt-0.5 text-slate-500" size={13} />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Stock Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdInventory size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Stock Summary</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Total Products', value: stock.totalProducts || 0 },
                { label: 'Total Units',    value: stock.totalUnits    || 0 },
                { label: 'Low Stock',      value: stock.lowStockCount || 0 },
                { label: 'Expired',        value: stock.expiredCount  || 0 },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-semibold text-slate-800 tracking-tight">{item.value}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Three-Pot Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdTrendingUp size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Three-Pot Status</h2>
              <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {threePot.equilibriumStatus === 'green' ? '✓ Equilibrium' :
                 threePot.equilibriumStatus === 'amber' ? '⚠ Near Limit'  : '✗ Breach'}
              </span>
            </div>

            <div className="p-5 space-y-3">
              {/* Pot 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pot 1 — Stock Value</p>
                    <p className="text-xl font-semibold text-slate-800 tracking-tight">{fmt(threePot.pot1StockValue)}</p>
                  </div>
                  <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <MdInventory size={17} className="text-slate-500" />
                  </div>
                </div>
                {/* Progress bar */}
                {threePot.pot2Deposit > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 rounded-full transition-all"
                        style={{ width: `${Math.min((threePot.pot1StockValue / threePot.pot2Deposit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {((threePot.pot1StockValue / threePot.pot2Deposit) * 100).toFixed(0)}% of deposit used
                    </p>
                  </div>
                )}
              </div>

              {/* Pot 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pot 2 — Deposit</p>
                    <p className="text-xl font-semibold text-slate-800 tracking-tight">{fmt(threePot.pot2Deposit)}</p>
                  </div>
                  <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <BiCheck size={17} className="text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrescriberDashboard;