import { useState } from 'react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { useMyOrders } from '../hooks/usePrescriberData';

const fmt = (n) => `£${parseFloat(n || 0).toFixed(2)}`;

const statusColors = {
  pending:    'text-slate-600 bg-white',
  verified:   'text-slate-600 bg-white',
  dispensing: 'text-slate-600 bg-white',
  dispatched: 'text-slate-600 bg-white',
  delivered:  'text-slate-600 bg-white',
  cancelled:  'text-slate-600 bg-white',
};

const STATUSES = ['', 'pending', 'verified', 'dispensing', 'dispatched', 'delivered', 'cancelled'];

const PrescriberOrders = () => {
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [expanded, setExpanded] = useState(null);
  const { orders, total, loading } = useMyOrders(status, page);

  return (
    <div className="w-full overflow-x-hidden">
      <PrescriberHeader title="My Orders" />
      <div className="p-4 sm:p-8 w-full max-w-[100vw]">

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar w-full">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition
                ${status === s
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Container */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 font-medium">No orders found</div>
        ) : (
          <div className="space-y-4 w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
              <table className="w-full text-sm table-fixed">
                <thead className="border-b border-gray-100">
                  <tr>
                    {['ID', 'Patient', 'Revenue', 'Comm.', 'Status', 'Date', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide truncate">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <OrderRow key={order._id} order={order} expanded={expanded} setExpanded={setExpanded} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 w-full">
              {orders.map((order) => (
                <MobileOrderCard key={order._id} order={order} expanded={expanded} setExpanded={setExpanded} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-6 w-full">
            <p className="text-xs text-gray-400 truncate mr-2">Showing {orders.length} of {total}</p>
            <div className="flex gap-2 shrink-0">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition">Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderRow = ({ order, expanded, setExpanded }) => (
  <>
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
      <td className="px-5 py-4 font-bold text-gray-900 text-xs truncate">{order._id.slice(-8).toUpperCase()}</td>
      <td className="px-5 py-4 text-gray-700 truncate">{order.customer?.firstName} {order.customer?.lastName}</td>
      <td className="px-5 py-4 text-gray-700 truncate">{fmt(order.financials?.revenueExVat)}</td>
      <td className="px-5 py-4 font-semibold text-teal-700 truncate">{fmt(order.financials?.commissionExVat)}</td>
      <td className="px-5 py-4 truncate"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'text-slate-600 bg-white'}`}>● {order.status}</span></td>
      <td className="px-5 py-4 text-gray-400 text-xs truncate">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
      <td className="px-5 py-4"><button onClick={() => setExpanded(expanded === order._id ? null : order._id)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">{expanded === order._id ? 'Hide' : 'View'}</button></td>
    </tr>
    {expanded === order._id && <CommissionDetails order={order} colSpan={7} />}
  </>
);

const MobileOrderCard = ({ order, expanded, setExpanded }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold">Order ID</p>
        <p className="font-bold text-sm text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
      </div>
      <button onClick={() => setExpanded(expanded === order._id ? null : order._id)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg">
        {expanded === order._id ? 'Hide' : 'View'}
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div><p className="text-gray-400">Patient</p><p className="font-medium truncate">{order.customer?.firstName} {order.customer?.lastName}</p></div>
      <div><p className="text-gray-400">Commission</p><p className="font-semibold text-teal-700">{fmt(order.financials?.commissionExVat)}</p></div>
    </div>
    {expanded === order._id && <div className="mt-4 pt-4 border-t border-gray-100"><CommissionDetails order={order} /></div>}
  </div>
);

const CommissionDetails = ({ order, colSpan = 1 }) => (
  <tr className="bg-gray-50">
    <td colSpan={colSpan} className="px-2 sm:px-5 py-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs w-full">
        {[
          { label: 'Revenue', value: fmt(order.financials?.revenueExVat) },
          { label: 'COGS', value: fmt(order.financials?.cogsExVat) },
          { label: 'My Commission', value: fmt(order.financials?.commissionExVat), highlight: true },
          { label: 'Status', value: order.commissionStatus?.replace('_', ' ') }
        ].map((item, i) => (
          <div key={i} className={`rounded-lg p-2 sm:p-3 ${item.highlight ? 'bg-teal-600 text-white' : 'bg-white border border-gray-100'}`}>
            <p className="font-bold truncate">{item.value}</p>
            <p className="opacity-70 mt-0.5 truncate">{item.label}</p>
          </div>
        ))}
      </div>
    </td>
  </tr>
);

export default PrescriberOrders;