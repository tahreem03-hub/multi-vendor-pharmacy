import { useState, useEffect } from 'react';
import { User, Search, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const PrescriberPatient = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // ✅ FIX: correct route is /prescriber-link/patients not /prescriber/patients
        const res = await API.get('/prescriber-link/patients');
        setPatients(res.data?.patients || []);
      } catch (error) {
        console.error('Failed to load patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const query = search.toLowerCase();
    return (
      `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(query)
      || (p.personalEmail || '').toLowerCase().includes(query)
      || (p.mobileNumber || '').toLowerCase().includes(query)
    );
  });

  const handleDelete = async (patientId) => {
    if (!window.confirm('Delete this patient and all requests for them?')) return;
    try {
      // ✅ FIX: correct route
      await API.delete(`/prescriber-link/patients/${patientId}`);
      setPatients((prev) => prev.filter((patient) => patient._id !== patientId));
      if (selected?._id === patientId) setSelected(null);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      alert(error.response?.data?.message || 'Unable to delete patient');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Patients" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {filtered.length} patients
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Patient List */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                  <User size={20} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No patients found</p>
              </div>
            ) : filtered.map(p => (
              <button key={p._id}
                onClick={() => setSelected(p)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  selected?._id === p._id ? 'border-slate-400 shadow-sm' : 'border-slate-100'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-600">
                      {p.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {p.personalEmail || p.mobileNumber || 'No contact info'}
                    </p>
                  </div>
                  {p.dob && (
                    <p className="text-xs text-slate-400 shrink-0">
                      {new Date(p.dob).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Patient Detail */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit sticky top-5">
            {!selected ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <User size={24} className="text-slate-200" />
                <p className="text-xs text-slate-400 font-medium">Select a patient to view details</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-600">
                        {selected.firstName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selected.firstName} {selected.lastName}
                      </p>
                      {selected.dob && (
                        <p className="text-xs text-slate-400">
                          DOB: {new Date(selected.dob).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected._id)}
                    className="inline-flex items-center gap-2 px-1 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-3 border-t border-slate-50 pt-4">
                  {selected.personalEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-300 shrink-0" />
                      <p className="text-xs text-slate-600 truncate">{selected.personalEmail}</p>
                    </div>
                  )}
                  {selected.mobileNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-300 shrink-0" />
                      <p className="text-xs text-slate-600">{selected.mobileNumber}</p>
                    </div>
                  )}
                  {(selected.addressLine1 || selected.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-slate-300 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-600 leading-relaxed">
                        {[selected.addressLine1, selected.addressLine2, selected.city, selected.postcode, selected.country]
                          .filter(Boolean).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriberPatient;