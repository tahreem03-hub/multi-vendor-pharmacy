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

  const onePort = data?.threePot || {};
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
            {/* ... [Table remains the same as your original code] ... */}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             {/* ... [Alerts remain the same as your original code] ... */}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             {/* ... [Stock Summary remains the same as your original code] ... */}
          </div>

          {/* OnePort Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdTrendingUp size={15} className="text-slate-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">OnePort Status</h2>
            </div>

            <div className="p-5 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Available Cash Balance</p>
                    <p className="text-xl font-semibold text-slate-800 tracking-tight">{fmt(onePort.cashBalance)}</p>
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