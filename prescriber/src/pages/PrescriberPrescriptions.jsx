import { useState, useEffect } from 'react';
import {
  FileText, Search, Eye, Trash2, UserPlus, ShieldCheck,
  CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';
import toast from "react-hot-toast";

const statuses = ['all', 'pending', 'approved', 'rejected', 'dispensed', 'issued'];

const statusConfig = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-500 border-red-200',
  dispensed: 'bg-green-50 text-green-600 border-green-200',
  issued: 'bg-purple-50 text-purple-600 border-purple-200',
};

// ── link-request status badge ─────────────────────────────────
const LinkBadge = ({ status }) => {
  const map = {
    pending:  { cls: 'bg-amber-50 text-amber-700 border-amber-200',      icon: <Clock size={10} />,          label: 'pending'  },
    active:   { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={10} />,    label: 'verified' },
    rejected: { cls: 'bg-red-50 text-red-600 border-red-200',            icon: <AlertTriangle size={10} />,  label: 'rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide border ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

const InfoCell = ({ label, value }) => !value ? null : (
  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
    <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-0.5 uppercase">{label}</p>
    <p className="text-xs font-semibold text-slate-700 break-words">{value}</p>
  </div>
);

const PrescriberPrescriptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab]       = useState('prescriptions'); // 'prescriptions' | 'links'
  const [prescriptions, setPrescriptions] = useState([]);
  const [linkRequests, setLinkRequests] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [expandedId, setExpandedId]     = useState(null);

  const prescriptionId = searchParams.get('prescriptionId');

  // ── fetch both on mount so the Link Requests tab badge is accurate ──
  useEffect(() => {
    fetchPrescriptions();
    fetchLinkRequests();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/prescriptions/my');
      setPrescriptions(response.data?.prescriptions || response.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only THIS prescriber's own incoming link requests
  const fetchLinkRequests = async () => {
    try {
      setLinksLoading(true);
      const res = await API.get('/prescriber-link/my-link-requests');
      setLinkRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching link requests:', error);
      if (error.response?.status !== 404) toast.error('Could not load link requests');
    } finally {
      setLinksLoading(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    const matchesSearch = search === '' || (
      p.patientDetails?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientDetails?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      p._id?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingLinkCount = linkRequests.filter(l => l.status === 'pending').length;

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
            <div>
              <p className="text-sm font-bold text-gray-800">Delete Prescription?</p>
              <p className="text-xs text-gray-400 mt-0.5">Cannot undo</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { toast.dismiss(t.id); resolve(true); }}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(false); }}
                className="px-4 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "top-center", style: { background: "transparent", boxShadow: "none", padding: 0 } }
      );
    });

    if (!confirmed) return;
    try {
      await API.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => p._id !== id));
      toast.success("Prescription deleted.");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(error.response?.data?.message || "Unable to delete prescription.");
    }
  };

  // Approve/reject a PRESCRIPTION REQUEST (prescriber-only route)
  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/verify-request/${id}`, { status });
      setPrescriptions(prev => prev.map(p => (p._id === id ? { ...p, status } : p)));
      toast.success(`Prescription ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Unable to update');
    }
  };

  // Approve/reject an incoming LINK REQUEST (prescriber-only, ownership-checked)
  const handleLinkAction = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/verify-link/${id}`, { status });
      setLinkRequests(prev => prev.map(l => (l._id === id ? { ...l, status } : l)));
      toast.success(status === 'active' ? 'Link approved ✓' : 'Request rejected');
    } catch (error) {
      console.error('Failed to update link:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleViewPrescription = (id) => {
    navigate(`/dashboard?page=prescriptions&prescriptionId=${id}`);
  };

  const getPatientName = (p) => {
    if (p.patientDetails?.firstName) return `${p.patientDetails.firstName} ${p.patientDetails.lastName || ''}`.trim();
    if (p.patientName?.firstName)    return `${p.patientName.firstName} ${p.patientName.lastName || ''}`.trim();
    return 'Unknown Patient';
  };

  const getInitial = (p) =>
    (p.patientDetails?.firstName || p.patientName?.firstName || 'P').charAt(0).toUpperCase();

  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id));

  const linkerName = (l) =>
    l.requesterId?.name ||
    `${l.requesterId?.firstName || ''} ${l.requesterId?.lastName || ''}`.trim() ||
    'Unknown';

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Prescriptions" />
      <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          {[
            { key: 'prescriptions', label: 'Prescriptions',  icon: <FileText size={13} />,   count: 0 },
            { key: 'links',         label: 'Link Requests',  icon: <ShieldCheck size={13} />, count: pendingLinkCount },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setExpandedId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.key ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === t.key ? 'bg-white text-slate-800' : 'bg-amber-100 text-amber-700'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════ PRESCRIPTIONS TAB ══════════════ */}
        {activeTab === 'prescriptions' && (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  placeholder="Search by patient or ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all flex-shrink-0 ${
                      filter === s ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                  <FileText size={20} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No prescriptions found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        {['Patient', 'Date', 'Treatment', 'Status', '', ''].map((h, i) => (
                          <th key={i} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(p => (
                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-slate-600">{getInitial(p)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{getPatientName(p)}</p>
                                <p className="text-[10px] text-slate-400 font-mono">#{p._id?.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{p.treatment || p.method || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusConfig[p.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {p.status || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {p.status === 'pending' && p.type === 'request' ? (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(p._id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                                >approve</button>
                                <button
                                  onClick={() => handleStatusUpdate(p._id, 'rejected')}
                                  className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors"
                                >reject</button>
                              </>
                            ) : (
                              <button onClick={() => handleViewPrescription(p._id)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                                <Eye size={14} />
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filtered.map(p => (
                    <div key={p._id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-slate-600">{getInitial(p)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{getPatientName(p)}</p>
                            <p className="text-[10px] text-slate-400 font-mono">#{p._id?.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${statusConfig[p.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {p.status || 'unknown'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-500">
                            <span className="font-medium text-slate-700">Date:</span>{' '}
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                          <p className="text-slate-500">
                            <span className="font-medium text-slate-700">Treatment:</span>{' '}
                            {p.treatment || p.method || '—'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.status === 'pending' && p.type === 'request' ? (
                            <div className="flex flex-col sm:flex-row gap-1.5">
                              <button onClick={() => handleStatusUpdate(p._id, 'approved')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all">approve</button>
                              <button onClick={() => handleStatusUpdate(p._id, 'rejected')} className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-[10px] font-black hover:bg-slate-100 transition-all">reject</button>
                            </div>
                          ) : (
                            <button onClick={() => handleViewPrescription(p._id)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                              <Eye size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════ LINK REQUESTS TAB ══════════════ */}
        {activeTab === 'links' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <UserPlus size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-700">Link Requests</h2>
              <span className="ml-auto text-[11px] text-slate-400">Requests sent to you by patients / clinics</span>
            </div>

            {linksLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : linkRequests.length === 0 ? (
              <div className="py-16 text-center">
                <UserPlus size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-400">No link requests</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {linkRequests.map(link => (
                  <div key={link._id}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">{linkerName(link)}</p>
                          <LinkBadge status={link.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {link.requesterRole || '—'}
                          <span className="mx-1">·</span>
                          Reg: <span className="font-semibold text-slate-700">{link.registrationNumber || '—'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {link.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleLinkAction(link._id, 'active')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => handleLinkAction(link._id, 'rejected')}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors">
                              Reject
                            </button>
                          </div>
                        )}
                        <button onClick={() => toggle(link._id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                          {expandedId === link._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {expandedId === link._id && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <InfoCell label="Email"           value={link.requesterId?.email} />
                          <InfoCell label="Registration No" value={link.registrationNumber} />
                          <InfoCell label="Message"         value={link.message || 'No message'} />
                          <InfoCell label="Submitted"       value={link.createdAt ? new Date(link.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PrescriberPrescriptions;