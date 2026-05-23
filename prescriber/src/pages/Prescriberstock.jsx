import { useState } from 'react';
import { MdWarning } from 'react-icons/md';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { useMyStock } from '../hooks/usePrescriberData';

const expiryBadge = {
  none:     { label: 'OK',         cls: 'text-green-600 bg-green-50'  },
  '60_days':{ label: '60 Day Alert',cls: 'text-yellow-600 bg-yellow-50'},
  '30_days':{ label: '30 Day Alert',cls: 'text-orange-500 bg-orange-50'},
  expired:  { label: 'EXPIRED',     cls: 'text-red-600 bg-red-50'       },
};

const FILTERS = [
  { label: 'All Stock',      expiryAlert: '',        isLowStock: '' },
  { label: 'Low Stock',      expiryAlert: '',        isLowStock: 'true' },
  { label: 'Expiring 60d',   expiryAlert: '60_days', isLowStock: '' },
  { label: 'Expiring 30d',   expiryAlert: '30_days', isLowStock: '' },
  { label: 'Expired',        expiryAlert: 'expired', isLowStock: '' },
];

const PrescriberStock = () => {
  const [filter, setFilter] = useState(0);
  const { expiryAlert, isLowStock } = FILTERS[filter];
  const { stock, count, loading } = useMyStock(expiryAlert, isLowStock);

  return (
    <div className="w-full">
      <PrescriberHeader title="My Stock" />
      <div className="p-4 sm:p-8">

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f, idx) => (
            <button
              key={idx}
              onClick={() => setFilter(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition
                ${filter === idx
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table Wrapper for responsiveness */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stock.length === 0 ? (
            <p className="text-center text-gray-400 py-16 font-medium">No stock found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    {['Product', 'Category', 'Available', 'Pot 1 Value', 'Expiry Date', 'Expiry Alert', 'Low Stock'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => {
                    const badge = expiryBadge[item.expiryAlert] || expiryBadge.none;
                    return (
                      <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px]">{item.productName}</p>
                          {item.batchNumber && (
                            <p className="text-[10px] text-gray-400 mt-0.5">Batch: {item.batchNumber}</p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {item.product?.category || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${item.isLowStock ? 'text-orange-500' : 'text-gray-900'}`}>
                            {item.quantityAvailable}
                          </span>
                          {item.isLowStock && (
                            <MdWarning className="inline ml-1 text-orange-400" size={14} />
                          )}
                        </td>
                        <td className="px-5 py-3 font-semibold text-teal-700">
                          £{parseFloat(item.pot1Value || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString('en-GB')
                            : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {item.isLowStock ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-yellow-600 bg-yellow-50 whitespace-nowrap">
                              ⚠ Low
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-green-600 bg-green-50 whitespace-nowrap">
                              ✓ OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-4">{count} item{count !== 1 ? 's' : ''} total</p>
      </div>
    </div>
  );
};

export default PrescriberStock;