import { useState } from 'react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { useMyPatients } from '../hooks/usePrescriberData';

const PrescriberPatients = () => {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const { patients, total, loading } = useMyPatients(page);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const name = `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`.toLowerCase();
    const email = (p.patient?.email || '').toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div className="w-full">
      <PrescriberHeader title="My Patients" />
      <div className="p-4 sm:p-8">

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">👥 My Patients</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Unique patients who ordered via your prescriptions</p>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">{total} total patients</span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16 font-medium">No patients found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    {['Patient', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {p.patient?.firstName?.[0]}{p.patient?.lastName?.[0]}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {p.patient?.firstName} {p.patient?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 truncate max-w-[200px]">{p.patient?.email || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{p.orderCount}</td>
                      <td className="px-5 py-4 font-semibold text-teal-700 whitespace-nowrap">
                        £{parseFloat(p.totalSpent || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {p.lastOrder ? new Date(p.lastOrder).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">Page {page}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition">
                Previous
              </button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
                className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriberPatients;