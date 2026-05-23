import { useState, useEffect } from "react";
import API from "../api/axios";
import Header from "./Header";
import {
  UserPlus, CheckCircle, Loader2, Clock, AlertTriangle,
  ClipboardList, ShieldCheck, Trash2, Pill, Eye,
  ChevronDown, ChevronUp, FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { bg: "bg-white",   text: "text-black",   border: "border-black",   icon: <Clock size={10} />,         label: "pending"   },
    approved:  { bg: "bg-white",   text: "text-black",   border: "border-black",   icon: <CheckCircle size={10} />,  label: "approved"  },
    active:    { bg: "bg-white",   text: "text-black",   border: "border-black",   icon: <CheckCircle size={10} />,  label: "verified"  },
    rejected:  { bg: "bg-white",   text: "text-black",   border: "border-black",   icon: <AlertTriangle size={10} />, label: "rejected"  },
    dispensed: { bg: "bg-white",   text: "text-black",   border: "border-black",   icon: <CheckCircle size={10} />,   label: "dispensed" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tracking-wide border ${s.bg} ${s.text} ${s.border}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── info cell ─────────────────────────────────────────────────
const InfoCell = ({ label, value }) => !value ? null : (
  <div className="bg-white border border-black rounded-xl px-3 py-2.5">
    <p className="text-[9px] font-black text-black tracking-widest mb-0.5">{label}</p>
    <p className="text-xs font-semibold text-black">{value}</p>
  </div>
);

const Prescriptions = () => {
  const [activeTab, setActiveTab]   = useState("prescriptions");
  const [links, setLinks]           = useState([]);
  const [requests, setRequests]     = useState([]);
  const [pending, setPending]       = useState([]); // ← real prescriptions
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [linksRes, reqsRes, pendingRes] = await Promise.all([
        API.get("/prescriber-link/admin/pending"),
        API.get("/prescriber-link/admin/requests"),
        API.get("/prescriptions/pending"),           // ← real prescriptions
      ]);
      setLinks(Array.isArray(linksRes.data)                     ? linksRes.data                     : []);
      setRequests(Array.isArray(reqsRes.data)                   ? reqsRes.data                      : []);
      setPending(pendingRes.data?.prescriptions || []);
    } catch (err) {
      console.error("fetch error:", err);
      if (err.response?.status !== 404) toast.error("could not load data");
    } finally {
      setLoading(false);
    }
  };

  // ── verify real prescription ──────────────────────────────────
  const handleVerify = async (id, status) => {
    try {
      await API.patch(`/prescriptions/verify/${id}`, {
        status,
        note: noteInputs[id] || "",
      });
      toast.success(`prescription ${status} ✓`);
      fetchAll();
    } catch {
      toast.error("action failed");
    }
  };

  const handleLinkAction = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/admin/verify-link/${id}`, { status });
      toast.success(status === "active" ? "professional verified ✓" : "request rejected");
      fetchAll();
    } catch { toast.error("action failed"); }
  };

  const handleRequestAction = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/admin/verify-request/${id}`, { status });
      toast.success(status === "deleted" ? "request deleted" : `prescription ${status} ✓`);
      fetchAll();
    } catch { toast.error("action failed"); }
  };

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  const counts = {
    pendingPrescriptions: pending.filter(p => p.status === "pending").length,
    pendingLinks:         links.filter(l => l.status === "pending").length,
    pendingRequests:      requests.filter(r => r.status === "pending").length,
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white text-black">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      <Header title=" Prescription side" />

      <div className="max-w-6xl mx-auto p-6 space-y-5">

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "pending rx",         value: counts.pendingPrescriptions, color: "text-black",   bg: "bg-white"   },
            { label: "pending links",       value: counts.pendingLinks,         color: "text-black",   bg: "bg-white"  },
            { label: "total requests",      value: requests.length,             color: "text-black",   bg: "bg-white"     },
            { label: "pending requests",    value: counts.pendingRequests,      color: "text-black", bg: "bg-white" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-black rounded-2xl px-4 py-3 shadow-sm`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-black tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setActiveTab("pending"); setExpandedId(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-black text-white"
                : "bg-white text-black border border-black hover:bg-black hover:text-white"
            }`}
          >
            <FileText size={14} />
            prescriptions
            {counts.pendingPrescriptions > 0 && (
              <span className="bg-gray-400 px-1.5 py-0.5 rounded-md text-[10px]">{counts.pendingPrescriptions}</span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("prescriptions"); setExpandedId(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "prescriptions"
                ? "bg-black text-white"
                : "bg-white text-black border border-black hover:bg-black hover:text-white"
            }`}
          >
            <ClipboardList size={14} />
            prescription requests
            {counts.pendingRequests > 0 && (
              <span className="bg-gray-400 px-1.5 py-0.5 rounded-md text-[10px]">{counts.pendingRequests}</span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("links"); setExpandedId(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "links"
                ? "bg-black text-white"
                : "bg-white text-black border border-black hover:bg-black hover:text-white"
            }`}
          >
            <ShieldCheck size={14} />
            professional verification
            {counts.pendingLinks > 0 && (
              <span className="bg-gray-400 px-1.5 py-0.5 rounded-md text-[10px]">{counts.pendingLinks}</span>
            )}
          </button>
        </div>

        {/* ── real prescriptions tab ──────────────────────────── */}
        {activeTab === "pending" && (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black py-16 text-center">
                <FileText size={32} className="mx-auto text-black mb-3 opacity-20" />
                <p className="text-sm font-bold text-black opacity-40">no prescriptions submitted yet</p>
              </div>
            ) : (
              pending.map(rx => (
                <div key={rx._id} className="bg-white rounded-2xl border border-black shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-5 mb-0.5">
                        <p className="text-sm font-bold text-black">
                          {rx.patientDetails?.firstName} {rx.patientDetails?.lastName}
                        </p>
                        <StatusBadge status={rx.status} />
                        <span className="text-[12px] bg-white text-black border border-black px-3 py-0.5 rounded-full font-bold">
                          {rx.method}
                        </span>
                      </div>
                      <p className="text-[11px] text-black font-medium">
                        prescriber: <span className="text-black font-bold">
                          {rx.prescriberDetails?.name || "—"}
                        </span>
                        {rx.patientDetails?.email && (
                          <span className="ml-2">· {rx.patientDetails.email}</span>
                        )}
                      </p>
                    </div>

                    {rx.medications?.length > 0 && (
                      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-black border border-black rounded-xl">
                        <Pill size={12} className="text-white" />
                        <span className="text-[10px] font-black text-white">
                          {rx.medications.length} med{rx.medications.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {rx.image && (
                      <button
                        onClick={() => window.open(`http://localhost:4000/${rx.image}`, "_blank")}
                        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-black text-white rounded-xl text-[10px] font-black hover:opacity-80 transition-opacity"
                      >
                        <Eye size={12} /> view image
                      </button>
                    )}

                    <div className="shrink-0 flex gap-2">
                      {rx.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerify(rx._id, "approved")}
                            className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black hover:opacity-80 transition-opacity"
                          >
                            approve
                          </button>
                          <button
                            onClick={() => handleVerify(rx._id, "rejected")}
                            className="px-3 py-1.5 border border-black text-black rounded-lg text-[10px] font-black hover:bg-black hover:text-white transition-all"
                          >
                            reject
                          </button>
                        </>
                      )}
                      {rx.status === "approved" && (
                        <button
                          onClick={() => handleVerify(rx._id, "dispensed")}
                          className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black hover:opacity-80 transition-opacity"
                        >
                          mark dispensed
                        </button>
                      )}
                    </div>

                    <button onClick={() => toggle(rx._id)} className="text-black hover:opacity-60 transition-opacity shrink-0">
                      {expandedId === rx._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {expandedId === rx._id && (
                    <div className="border-t border-black px-5 py-4 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <InfoCell label="phone"         value={rx.patientDetails?.phone} />
                        <InfoCell label="dob"            value={rx.patientDetails?.dob ? new Date(rx.patientDetails.dob).toLocaleDateString("en-GB") : null} />
                        <InfoCell label="reg number"   value={rx.prescriberDetails?.regNumber} />
                        <InfoCell label="clinic"       value={rx.prescriberDetails?.clinicName} />
                        <InfoCell label="allergies"    value={rx.patientDetails?.allergies} />
                        <InfoCell label="address"       value={rx.patientDetails?.address} />
                        <InfoCell label="submitted"    value={rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                        <InfoCell label="verified at"  value={rx.verifiedAt ? new Date(rx.verifiedAt).toLocaleDateString("en-GB") : "—"} />
                      </div>

                      {rx.medications?.length > 0 && (
                        <div className="bg-white border border-black rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-black text-black tracking-widest mb-2">medications</p>
                          <div className="flex flex-wrap gap-2">
                            {rx.medications.map((m, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white border border-black rounded-lg text-[10px] font-bold text-black">
                                {m.name || m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rx.status === "pending" && (
                        <div>
                          <label className="text-[10px] font-black text-black tracking-widest">
                            pharmacist note (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="add a note..."
                            value={noteInputs[rx._id] || ""}
                            onChange={e => setNoteInputs(n => ({ ...n, [rx._id]: e.target.value }))}
                            className="mt-1 w-full bg-white border border-black rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      )}

                      {rx.pharmacistNote && (
                        <div className="bg-white border border-black rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-black text-black tracking-widest mb-1">pharmacist note</p>
                          <p className="text-xs text-black italic">"{rx.pharmacistNote}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── prescription requests tab ───────────────────────── */}
        {activeTab === "prescriptions" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black py-16 text-center">
                <ClipboardList size={32} className="mx-auto text-black mb-3 opacity-20" />
                <p className="text-sm font-bold text-black opacity-40">no prescription requests found</p>
              </div>
            ) : (
              requests.map(rx => (
                <div key={rx._id} className="bg-white rounded-2xl border border-black shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-black">
                          {rx.patient?.firstName} {rx.patient?.lastName}
                        </p>
                        <StatusBadge status={rx.status} />
                      </div>
                      <p className="text-[11px] text-black font-medium">
                        prescriber: <span className="text-black font-bold">{rx.prescriber?.name || "—"}</span>
                        {rx.treatment && <span className="ml-2">· {rx.treatment}</span>}
                      </p>
                    </div>
                    {rx.medications?.length > 0 && (
                      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-black border border-black rounded-xl">
                        <Pill size={12} className="text-white" />
                        <span className="text-[10px] font-black text-white">
                          {rx.medications.length} med{rx.medications.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {rx.consentDocumentation && (
                      <button onClick={() => window.open(rx.consentDocumentation, "_blank")}
                        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-black text-white rounded-xl text-[10px] font-black hover:opacity-80 transition-opacity">
                        <Eye size={12} /> consent
                      </button>
                    )}
                    <div className="shrink-0 flex gap-2">
                      {rx.status === "pending" && (
                        <>
                          <button onClick={() => handleRequestAction(rx._id, "approved")}
                            className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black hover:opacity-80 transition-opacity">
                            approve
                          </button>
                          <button onClick={() => handleRequestAction(rx._id, "rejected")}
                            className="px-3 py-1.5 border border-black text-black rounded-lg text-[10px] font-black hover:bg-black hover:text-white transition-all">
                            reject
                          </button>
                        </>
                      )}
                      {rx.status !== "pending" && (
                        <button onClick={() => handleRequestAction(rx._id, "deleted")}
                          className="p-1.5 text-black hover:bg-black hover:text-white rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <button onClick={() => toggle(rx._id)} className="text-black hover:opacity-60 transition-opacity shrink-0">
                      {expandedId === rx._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {expandedId === rx._id && (
                    <div className="border-t border-black px-5 py-4 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <InfoCell label="prescriber email" value={rx.prescriber?.email} />
                        <InfoCell label="treatment"         value={rx.treatment} />
                        <InfoCell label="request id"       value={`#${rx._id?.slice(-6).toUpperCase()}`} />
                        <InfoCell label="submitted"         value={rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                      </div>
                      {rx.clinicalNotes && (
                        <div className="bg-white border border-black rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-black text-black tracking-widest mb-1">clinical notes</p>
                          <p className="text-xs text-black italic">"{rx.clinicalNotes}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── professional verification tab ───────────────────── */}
        {activeTab === "links" && (
          <div className="bg-white rounded-2xl border border-black shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center">
                <UserPlus size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-black text-black">professional verification queue</h2>
            </div>
            {links.length === 0 ? (
              <div className="py-16 text-center">
                <UserPlus size={32} className="mx-auto text-black mb-3 opacity-20" />
                <p className="text-sm font-bold text-black opacity-40">no professional requests</p>
              </div>
            ) : (
              <div className="divide-y divide-black">
                {links.map(link => (
                  <div key={link._id}>
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-black text-black">
                            {link.requesterId?.name || `${link.requesterId?.firstName || ""} ${link.requesterId?.lastName || ""}`.trim() || "unknown"}
                          </p>
                          <StatusBadge status={link.status} />
                        </div>
                        <p className="text-[11px] text-black">
                          {link.requesterRole}
                          <span className="mx-1">·</span>
                          reg: <span className="font-bold text-black">{link.registrationNumber}</span>
                        </p>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        {link.status === "pending" && (
                          <>
                            <button onClick={() => handleLinkAction(link._id, "active")}
                              className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black hover:opacity-80 transition-opacity">
                              verify
                            </button>
                            <button onClick={() => handleLinkAction(link._id, "rejected")}
                              className="px-3 py-1.5 border border-black text-black rounded-lg text-[10px] font-black hover:bg-black hover:text-white transition-all">
                              reject
                            </button>
                          </>
                        )}
                      </div>
                      <button onClick={() => toggle(link._id)} className="text-black hover:opacity-60 transition-opacity shrink-0">
                        {expandedId === link._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    {expandedId === link._id && (
                      <div className="border-t border-black bg-white px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <InfoCell label="email"           value={link.requesterId?.email} />
                          <InfoCell label="registration no" value={link.registrationNumber} />
                          <InfoCell label="message"         value={link.message || "no message"} />
                          <InfoCell label="submitted"       value={link.createdAt ? new Date(link.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
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

export default Prescriptions;