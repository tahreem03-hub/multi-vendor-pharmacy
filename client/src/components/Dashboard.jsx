import { useState, useEffect } from 'react';
import { 
  BiCheckCircle, BiWallet, BiPackage, BiTrendingUp, 
  BiGroup, BiTime, BiChevronRight 
} from 'react-icons/bi';
import Header from './Header';
import API from '../api/axios';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// High-contrast status badges for white background
const statusColors = {
  pending:     'text-orange-600 bg-orange-50 border-orange-100',
  verified:    'text-blue-600 bg-blue-50 border-blue-100',
  dispensing:  'text-amber-600 bg-amber-50 border-amber-100',
  dispatched:  'text-cyan-600 bg-cyan-50 border-cyan-100',
  delivered:   'text-emerald-600 bg-emerald-50 border-emerald-100',
  cancelled:   'text-red-600 bg-red-50 border-red-100',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pots, setPots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, potsRes, prescriptionsRes, customersRes] = await Promise.all([
          API.get('/orders/admin/all?limit=5'),
          API.get('/three-pot/admin/all'),
          API.get('/prescriptions/pending'),
          API.get('/users'),
        ]);

        const allOrders = ordersRes.data.orders || [];
        setOrders(allOrders);
        setPots(potsRes.data.pots || []);

        setStats({
          totalOrders: ordersRes.data.count || 0,
          totalRevenue: allOrders.reduce((s, o) => s + (o.financials?.revenueExVat || 0), 0),
          totalCommission: allOrders.reduce((s, o) => s + (o.financials?.commissionExVat || 0), 0),
          pendingOrders: allOrders.filter(o => o.status === 'pending').length,
          totalPrescriptions: prescriptionsRes.data?.length || 0,
          totalCustomers: customersRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalPot1 = pots.reduce((s, p) => s + (p.pot1?.stockValueExVat || 0), 0);
  const totalPot2 = pots.reduce((s, p) => s + (p.pot2?.depositAmount || 0), 0);
  const totalPot3 = pots.reduce((s, p) => s + (p.pot3?.totalRevenueExVat || 0), 0);
  const totalComm = pots.reduce((s, p) => s + (p.pot3?.commissionSubAccount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders || 0, sub: `${stats?.pendingOrders || 0} awaiting`, icon: BiPackage, color: 'text-black', bg: 'bg-gray-100' },
    { label: 'Net Revenue', value: fmt(stats?.totalRevenue), sub: `Comm: ${fmt(stats?.totalCommission)}`, icon: BiTrendingUp, color: 'text-black', bg: 'bg-gray-100' },
    { label: 'Pending RX', value: stats?.totalPrescriptions || 0, sub: 'In verification', icon: BiTime, color: 'text-black', bg: 'bg-gray-100' },
    { label: 'Total Users', value: stats?.totalCustomers || 0, sub: 'All accounts', icon: BiGroup, color: 'text-black', bg: 'bg-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <Header title="Dashboard" />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Top Metric Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-1.5 rounded ${stat.bg} ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <span className="text-[12px] font-bold text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-black leading-none">{stat.value}</p>
              <p className="text-[12px] font-medium text-gray-600 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-[13px] font-bold text-black flex items-center gap-2">
                Recent Transactions
              </h3>
              <button className="text-[13px] font-bold text-gray-600 hover:text-black flex items-center">
                Full Log <BiChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[13px] text-gray-600 border-b border-gray-100">
                    <th className="px-5 py-3 font-bold">Ref ID</th>
                    <th className="px-5 py-3 font-bold">Patient</th>
                    <th className="px-5 py-3 font-bold text-right">Amount</th>
                    <th className="px-5 py-3 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {orders.map((order, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-black">{order._id?.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{order.customer?.firstName} {order.customer?.lastName}</td>
                      <td className="px-5 py-3 font-bold text-right text-black">{fmt(order.financials?.revenueExVat)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${statusColors[order.status] || 'text-gray-500 border-gray-200'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prescriber Equilibrium - Sidebar Style */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-[13px] font-bold text-black mb-6">Prescriber Health</h3>
            <div className="space-y-3">
              {pots.slice(0, 5).map((pot, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                  <div>
                    <p className="text-md font-bold text-black">{pot.prescriber?.firstName} {pot.prescriber?.lastName}</p>
                    <p className="text-[10px] font-medium text-gray-500 tracking-tighter">ID: {pot.prescriberId?.slice(-8)}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${pot.equilibriumStatus === 'green' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-red-500 ring-4 ring-red-50 animate-pulse'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Overall Financial Health - Wide Section */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
               <BiWallet className="text-black" size={20} />
               <h2 className="text-md font-bold text-black">Global Financial Equilibrium</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-2">
                <p className="text-[13px] text-gray-500 font-bold">Pot 1: Total Stock Value</p>
                <p className="text-2xl font-bold text-black">{fmt(totalPot1)}</p>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black w-[65%]" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] text-gray-500 font-bold">Pot 2: Total Deposits</p>
                <p className="text-2xl font-bold text-black">{fmt(totalPot2)}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <BiCheckCircle /> System Balanced
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex justify-between items-end mb-4">
                   <span className="text-[13px] font-bold text-gray-500">Gross Pot 3 Sales</span>
                   <span className="text-sm font-bold text-black">{fmt(totalPot3)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                   <span className="text-[12px] font-bold text-gray-700">Net Commission</span>
                   <span className="text-lg font-black text-black">{fmt(totalComm)}</span>
                </div>
              </div>
            </div>

            {/* Sub-account stats */}
            <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px]">
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                  <span className="font-bold text-gray-600">Vat Reserve Sub-Account:</span>
                  <span className="font-mono font-bold text-black">{fmt(pots.reduce((s, p) => s + (p.pot3?.vatReserveSubAccount || 0), 0))}</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                  <span className="font-bold text-gray-600">Pharmacy Net Payables:</span>
                  <span className="font-mono font-bold text-black">£0.00</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;