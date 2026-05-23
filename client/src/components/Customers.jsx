import { useState, useEffect } from "react";
import Header from "./Header";
import API from "../api/axios";

const Customers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    await API.patch(`/users/${id}/approve`);
    fetchUsers();
  };

  const handleReject = async (id) => {
    await API.patch(`/users/${id}/reject`);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm("delete this user?")) return;
    await API.delete(`/users/${id}`);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    (u?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen text-black">
      <Header title="Customers Side" />
      <div className="p-6">

        {/* search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search By Name or Email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-black text-black bg-white"
          />
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">loading users...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Verified</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-semibold text-black">{user.name}</td>
                    <td className="px-5 py-3 font-semibold text-black">{user.email}</td>
                    <td className="px-5 py-3">
                      {user.isVerified
                        ? <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">✓ verified</span>
                        : <span className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full font-medium">✗ unverified</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      {user.isApproved
                        ? <span className="text-xs bg-slate-100 text-black px-2 py-1 rounded-full font-medium">● approved</span>
                        : <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-medium">● pending</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-black text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {!user.isApproved ? (
                          <button onClick={() => handleApprove(user._id)}
                            className="text-xs px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-lg transition shadow-sm">
                            approve
                          </button>
                        ) : (
                          <button onClick={() => handleReject(user._id)}
                            className="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-black rounded-lg transition shadow-sm">
                            revoke
                          </button>
                        )}
                        <button onClick={() => handleDelete(user._id)}
                          className="text-xs px-3 py-1.5 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-lg transition shadow-sm">
                          delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">no users found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;