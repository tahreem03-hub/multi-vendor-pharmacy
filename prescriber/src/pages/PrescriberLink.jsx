import { useState, useEffect } from "react";
import {
  UserPlus, Search, ClipboardList, Send, Upload,
  CheckCircle, Loader2, Package, X, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const BASE = "http://localhost:4000";

// Updated for light theme with green accents
const inputClass = "w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all text-black placeholder:text-gray-400";
const labelClass = "text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.15em]";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const PrescriberLink = () => {
  const [loading, setLoading]               = useState(false);
  const [searching, setSearching]           = useState(false);
  const [searchResults, setSearchResults]   = useState([]);
  const [activePrescribers, setActivePrescribers] = useState([]);
  const [consentFile, setConsentFile]       = useState(null);
  const [consentPreview, setConsentPreview] = useState(null);
  const [selectedName, setSelectedName]     = useState("");
  const [productQuery, setProductQuery]     = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts]   = useState([]);

  const [linkData, setLinkData] = useState({
    prescriberId:       "",
    registrationNumber: "",
    role:               "Aesthetic nurse non-prescriber",
    message:            "",
  });

  const [requestData, setRequestData] = useState({
    prescriberId:     "",
    patientFirstName: "",
    patientLastName:  "",
    dob:               "",
    consultationDate: new Date().toISOString().split("T")[0],
    treatment:        "Dermal Fillers",
    clinicalNotes:    "",
  });

  const token = () => localStorage.getItem("token");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => { fetchActiveLinks(); }, []);

  const fetchActiveLinks = async () => {
    try {
      const { data } = await axios.get(`${BASE}/api/prescriber-link/active-links`, { headers: headers() });
      setActivePrescribers(Array.isArray(data) ? data : []);
    } catch { setActivePrescribers([]); }
  };

  const handleSearch = async (query) => {
    setSelectedName(query);
    setLinkData(p => ({ ...p, prescriberId: "" }));
    if (!query || query.length < 3) return setSearchResults([]);
    setSearching(true);
    try {
      const { data } = await axios.get(`${BASE}/api/prescriber-link/search`, {
        params: { query }, headers: headers(),
      });
      setSearchResults(Array.isArray(data) ? data : (data.users || []));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleProductSearch = async (query) => {
    setProductQuery(query);
    if (query.length < 2) return setAvailableProducts([]);
    try {
      const { data } = await axios.get(`${BASE}/api/medicines?search=${query}`);
      setAvailableProducts(Array.isArray(data) ? data : (data.medicines || []));
    } catch { setAvailableProducts([]); }
  };

  const addProduct = (p) => {
    if (!selectedProducts.find(x => x._id === p._id)) {
      setSelectedProducts(prev => [...prev, p]);
    }
    setProductQuery(""); setAvailableProducts([]);
  };

  const handleLinkRequest = async () => {
    if (!linkData.prescriberId) return toast.error("Select a prescriber from search results");
    if (!linkData.registrationNumber) return toast.error("Enter your registration number");
    setLoading(true);
    try {
      await axios.post(`${BASE}/api/prescriber-link/link`, {
        prescriberId:       linkData.prescriberId,
        requesterRole:      linkData.role,
        registrationNumber: linkData.registrationNumber,
        message:            linkData.message,
      }, { headers: headers() });
      toast.success("Link request sent!");
      setLinkData({ prescriberId: "", registrationNumber: "", role: "Aesthetic nurse non-prescriber", message: "" });
      setSelectedName("");
      fetchActiveLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally { setLoading(false); }
  };

  const handlePrescriptionSubmit = async () => {
    if (!requestData.prescriberId)    return toast.error("Select a linked prescriber");
    if (!requestData.patientFirstName || !requestData.patientLastName) return toast.error("Enter patient name");
    if (!consentFile)                 return toast.error("Upload consent documentation");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("consentFile", consentFile);
      fd.append("prescriberId",     requestData.prescriberId);
      fd.append("patientFirstName", requestData.patientFirstName);
      fd.append("patientLastName",  requestData.patientLastName);
      fd.append("dob",              requestData.dob);
      fd.append("consultationDate", requestData.consultationDate);
      fd.append("treatment",        requestData.treatment);
      fd.append("clinicalNotes",    requestData.clinicalNotes);
      fd.append("productsRequired", JSON.stringify(selectedProducts.map(p => p._id)));

      await axios.post(`${BASE}/api/prescriber-link/request-prescription`, fd, {
        headers: { ...headers(), "Content-Type": "multipart/form-data" },
      });

      toast.success("Submitted to prescriber!");
      setConsentFile(null); setConsentPreview(null); setSelectedProducts([]);
      setRequestData(p => ({ ...p, patientFirstName: "", patientLastName: "", dob: "", clinicalNotes: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setLoading(false); }
  };

  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <div className="bg-white min-h-screen font-sans text-black">

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-8 py-5 mb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-black tracking-tight">Prescriber Collaboration</h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Connect with clinicians to authorize treatments</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Section 1: Link a Prescriber */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/20">
                <UserPlus size={16} />
              </div>
              <h2 className="text-sm font-bold text-black tracking-tight">Link a Prescriber</h2>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Search Prescribers">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searching && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#22c55e] animate-spin" />}
                  <input
                    type="text"
                    value={selectedName}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Type name (min 3 chars)..."
                    className={`${inputClass} pl-9`}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-xl z-20 mt-1 max-h-44 overflow-y-auto">
                      {searchResults.map(p => (
                        <div key={p._id}
                          onClick={() => {
                            setLinkData(prev => ({ ...prev, prescriberId: p._id }));
                            setSelectedName(p.name);
                            setSearchResults([]);
                            toast.success(`✅ Selected: ${p.name}`);
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <p className="text-xs font-bold text-black">{p.name}</p>
                          <p className="text-[10px] text-gray-500">{p.email} · {p.role}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {linkData.prescriberId && (
                  <p className="text-[10px] text-[#16a34a] font-bold flex items-center gap-1 mt-1">
                    <CheckCircle size={11} /> Prescriber selected
                  </p>
                )}
              </Field>

              <Field label="Professional Registration">
                <input type="text" value={linkData.registrationNumber}
                  onChange={e => setLinkData(p => ({ ...p, registrationNumber: e.target.value }))}
                  placeholder="e.g. GMC 1234567" className={inputClass} />
              </Field>

              <Field label="Your Role">
                <select value={linkData.role} onChange={e => setLinkData(p => ({ ...p, role: e.target.value }))} className={selectClass}>
                  <option className="bg-white">Aesthetic nurse non-prescriber</option>
                  <option className="bg-white">Aesthetic therapist</option>
                  <option className="bg-white">Doctor (non-prescriber)</option>
                  <option className="bg-white">Dentist (non-prescriber)</option>
                  <option className="bg-white">Paramedic</option>
                  <option className="bg-white">Other healthcare professions</option>
                </select>
              </Field>

              <Field label="Message to Prescriber (Optional)">
                <textarea rows={3} value={linkData.message}
                  onChange={e => setLinkData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Introduce yourself..."
                  className={`${inputClass} resize-none`} />
              </Field>

              <button onClick={handleLinkRequest} disabled={loading}
                className="w-full py-3 bg-[#22c55e] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#16a34a] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-[#16a34a]/20">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Link Request
              </button>
            </div>
          </div>

          {/* Section 2: Request a Prescription */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/20">
                <ClipboardList size={16} />
              </div>
              <h2 className="text-sm font-bold text-black tracking-tight">Request a Prescription</h2>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Send to Prescriber *">
                <select value={requestData.prescriberId}
                  onChange={e => setRequestData(p => ({ ...p, prescriberId: e.target.value }))}
                  className={selectClass}>
                  <option value="" className="bg-white">— Select linked professional —</option>
                  {activePrescribers.map(link => (
                    <option key={link._id} value={link.prescriberId?._id} className="bg-white">
                      {link.prescriberId?.name}
                      {link.status === "pending" ? " (Pending Approval)" : ""}
                    </option>
                  ))}
                </select>
                {activePrescribers.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={11} /> No linked prescribers yet
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Patient First Name *">
                  <input type="text" value={requestData.patientFirstName} placeholder="First"
                    onChange={e => setRequestData(p => ({ ...p, patientFirstName: e.target.value }))}
                    className={inputClass} />
                </Field>
                <Field label="Patient Last Name *">
                  <input type="text" value={requestData.patientLastName} placeholder="Last"
                    onChange={e => setRequestData(p => ({ ...p, patientLastName: e.target.value }))}
                    className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth *">
                  <input type="date" value={requestData.dob}
                    onChange={e => setRequestData(p => ({ ...p, dob: e.target.value }))}
                    className={inputClass} />
                </Field>
                <Field label="Consultation Date *">
                  <input type="date" value={requestData.consultationDate}
                    onChange={e => setRequestData(p => ({ ...p, consultationDate: e.target.value }))}
                    className={inputClass} />
                </Field>
              </div>

              <Field label="Treatment *">
                <select value={requestData.treatment}
                  onChange={e => setRequestData(p => ({ ...p, treatment: e.target.value }))}
                  className={selectClass}>
                  <option className="bg-white">Dermal Fillers</option>
                  <option className="bg-white">Anti-Wrinkle Injection</option>
                  <option className="bg-white">Vitamin B12</option>
                  <option className="bg-white">Skin Booster</option>
                </select>
              </Field>

              <Field label="Products Required">
                <div className="relative">
                  <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={productQuery}
                    onChange={e => handleProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className={`${inputClass} pl-9`} />
                  {availableProducts.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-xl z-20 mt-1 max-h-40 overflow-y-auto">
                      {availableProducts.map(prod => (
                        <div key={prod._id} onClick={() => addProduct(prod)}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-xs font-bold text-gray-700 border-b border-gray-100 last:border-0">
                          {prod.name}
                          {prod.category && <span className="text-gray-400 font-medium ml-2">· {prod.category}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProducts.map(p => (
                      <span key={p._id} className="flex items-center gap-1.5 bg-[#22c55e]/5 text-[#16a34a] border border-[#22c55e]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                        {p.name}
                        <button type="button" onClick={() => setSelectedProducts(prev => prev.filter(x => x._id !== p._id))}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Clinical Notes for Prescriber">
                <textarea value={requestData.clinicalNotes} rows={2}
                  onChange={e => setRequestData(p => ({ ...p, clinicalNotes: e.target.value }))}
                  placeholder="Patient history..."
                  className={`${inputClass} resize-none`} />
              </Field>

              <Field label="Consent Documentation *">
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5 transition-all cursor-pointer">
                  <input type="file" accept="image/*,.pdf" onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setConsentFile(f); setConsentPreview(URL.createObjectURL(f)); }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {consentPreview ? (
                    <div className="flex items-center gap-3">
                      <img src={consentPreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                      <div>
                        <p className="text-xs font-bold text-black truncate max-w-[160px]">{consentFile?.name}</p>
                        <p className="text-[10px] text-[#16a34a] font-bold mt-0.5 flex items-center gap-1">
                          <CheckCircle size={10} /> Ready
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-300 mb-1.5" />
                      <p className="text-xs font-bold text-gray-400">Upload consent form</p>
                    </>
                  )}
                </label>
              </Field>

              <button onClick={handlePrescriptionSubmit} disabled={loading}
                className="w-full py-3 bg-[#22c55e] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#16a34a] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-[#16a34a]/20">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Submit to Prescriber
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrescriberLink;