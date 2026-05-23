import { useState, useEffect } from 'react';
import { 
  BiBarChartAlt2, BiCartAlt, BiPound, BiSync, 
  BiPackage, BiCategoryAlt, BiTrendingUp 
} from 'react-icons/bi';
import Header from './Header';
import API from '../api/axios';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Analytics = () => {
  const [orders, setOrders]     = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, medRes] = await Promise.all([
          API.get('/orders/admin/all'),
          API.get('/medicines'),
        ]);
        setOrders(ordersRes.data.orders || []);
        setMedicines(Array.isArray(medRes.data) ? medRes.data : medRes.data.medicines || []);
      } catch (err) {
        console.error('analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // logic
  const totalRevenue    = orders.reduce((s, o) => s + (o.financials?.revenueExVat    || 0), 0);
  const totalCommission = orders.reduce((s, o) => s + (o.financials?.commissionExVat || 0), 0);
  const totalItems      = orders.reduce((s, o) => s + (o.items?.length || 0), 0);
  const avgItemsPerOrder= orders.length ? (totalItems / orders.length).toFixed(1) : 0;
  const avgOrderValue   = orders.length ? (totalRevenue / orders.length).toFixed(2) : 0;

  const productRevenue = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      const name = item.productName || 'unknown';
      if (!productRevenue[name]) productRevenue[name] = { name, units: 0, revenue: 0 };
      productRevenue[name].units   += item.quantity || 0;
      productRevenue[name].revenue += (item.unitRevenueExVat || 0) * (item.quantity || 0);
    });
  });
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const categoryRevenue = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      const med = medicines.find(m => m.name === item.productName);
      const cat = med?.category || 'other';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.unitRevenueExVat || 0) * (item.quantity || 0);
    });
  });
  const categoryTotal = Object.values(categoryRevenue).reduce((s, v) => s + v, 0);
  const categoryData  = Object.entries(categoryRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value,
      percent: categoryTotal ? Math.round((value / categoryTotal) * 100) : 0,
    }));

  const statCards = [
    { icon: BiCartAlt, value: avgItemsPerOrder, label: 'items / order', sub: 'basket avg' },
    { icon: BiPound, value: fmt(avgOrderValue), label: 'order value', sub: 'average gross' },
    { icon: BiTrendingUp, value: orders.length, label: 'transactions', sub: 'volume' },
    { icon: BiBarChartAlt2, value: fmt(totalCommission), label: 'commission', sub: 'platform net' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black antialiased font-sans">
      <Header title="Analytics Side" />
      
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* compact header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-xl font-bold text-black tracking-tight">Business Intelligence</h1>
            <p className="text-[11px] font-medium text-gray-500">real-time performance data</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-[10px] font-bold text-gray-400 block">last updated</span>
            <span className="text-xs font-mono font-semibold">today, {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* mini stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 rounded bg-gray-100 text-black">
                  <stat.icon size={16} />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-black leading-none">{stat.value}</p>
              <p className="text-[10px] font-medium text-gray-500 mt-2 italic">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* top products table - compact */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
                <BiPackage className="text-black" /> revenue by product
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-400 bg-white">
                    <th className="px-5 py-3 font-bold">product name</th>
                    <th className="px-5 py-3 font-bold text-center">units</th>
                    <th className="px-5 py-3 font-bold text-right">net sales</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-700">{p.name}</td>
                      <td className="px-5 py-3 text-center text-gray-500">{p.units}</td>
                      <td className="px-5 py-3 font-bold text-right text-black">{fmt(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* segment allocation - clean progress bars */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-[11px] font-bold text-gray-500 mb-6 flex items-center gap-2">
              <BiCategoryAlt className="text-black" /> category split
            </h3>
            <div className="space-y-5">
              {categoryData.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="font-bold text-gray-600">{cat.name}</span>
                    <span className="font-mono text-black">{cat.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-black h-full rounded-full"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* growth timeline - full width below */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-black text-white flex justify-between items-center">
              <h3 className="text-[10px] font-bold">monthly growth matrix</h3>
              <span className="text-[9px] bg-gray-700 px-2 py-0.5 rounded">financial year 25/26</span>
            </div>
            <div className="overflow-x-auto">
              {(() => {
                const grouped = {};
                orders.forEach(o => {
                  const d = new Date(o.createdAt);
                  const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                  if (!grouped[key]) grouped[key] = { month: key, revenue: 0, commission: 0 };
                  grouped[key].revenue += o.financials?.revenueExVat || 0;
                  grouped[key].commission += o.financials?.commissionExVat || 0;
                });
                const months = Object.values(grouped);
                
                return (
                  <table className="w-full text-left">
                    <tbody className="text-xs">
                      {months.map((m, i) => (
                        <tr key={i} className="border-t border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-black w-32">{m.month}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="flex-1 bg-gray-100 h-1 max-w-[200px] rounded-full overflow-hidden">
                                  <div className="bg-black h-full" style={{ width: `${(m.revenue / totalRevenue) * 100}%` }} />
                               </div>
                               <span className="text-[10px] font-bold text-gray-400">{fmt(m.revenue)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[10px] font-bold text-gray-400 mr-2">profit:</span>
                            <span className="font-bold text-emerald-600">{fmt(m.commission)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;