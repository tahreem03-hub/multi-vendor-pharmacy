import { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const PrescriberData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await API.get('/users');
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleApproval = async (userId, action) => {
    try {
      const response = await API.patch(`/users/${userId}/${action}`);
      setUsers(prev => prev.map(user => user._id === userId ? response.data.user : user));
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm) || user.email?.toLowerCase().includes(searchTerm);
    const matchesFilter = filterType === 'all' || (filterType === 'prescriber' && user.role === 'prescriber') || (filterType === 'non-prescriber' && user.role !== 'prescriber');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 antialiased">
      <PrescriberHeader title="Prescriber Data" />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Search & Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition"
            />
          </div>

          <div className="flex gap-1">
            {['all', 'prescriber', 'non-prescriber'].map((key) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                  filterType === key ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-slate-400 text-[10px]">ID: {user._id?.slice(-4)}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 capitalize">{user.role}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-md ${user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-md ${user.isApproved ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!user.isApproved ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleApproval(user._id, 'approve')} className="text-emerald-600 hover:text-emerald-700 font-bold">Approve</button>
                        <button onClick={() => handleApproval(user._id, 'reject')} className="text-red-600 hover:text-red-700 font-bold">Reject</button>
                      </div>
                    ) : <span className="text-slate-400">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrescriberData;