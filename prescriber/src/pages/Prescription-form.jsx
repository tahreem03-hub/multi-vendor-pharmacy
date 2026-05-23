import { useState } from "react";
import API from "../api/axios";
import {
  User, Stethoscope, FileText, Search, Plus, Trash2,
  CheckCircle, Loader2, AlertCircle, Pill, Truck, Upload, X, Lock
} from "lucide-react";
import { toast } from "react-hot-toast";

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 group">
    <label className="text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.15em] ml-0.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" />
      )}
      <input
        {...props}
        autoComplete="off"
        className={`w-full ${Icon ? "pl-9" : "pl-3.5"} pr-3.5 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all text-sm text-black placeholder:text-gray-400 font-medium`}
      />
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, children, isDisabled }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden transition-opacity ${isDisabled ? "opacity-60" : "opacity-100"}`}>
      <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center`}>
            <Icon size={16} />
          </div>
          <h2 className="text-sm font-bold text-black tracking-tight">{title}</h2>
        </div>
        {isDisabled && <Lock size={14} className="text-gray-400" />}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const PrescriptionForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicinesFetched, setMedicinesFetched] = useState(false);

  // File Upload States
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const initialState = {
    patient: {
      firstName: "", lastName: "", gender: "Male",
      dob: "", email: "", phone: "", address: "",
      allergies: "", contraindications: "",
    },
    
    medications: [],
    delivery: {
      fulfillmentMethod: "Ship direct to the address",
      deliveryAddress:   "",
      validity:          "27 days",
    },
  };

  const [formData, setFormData] = useState(initialState);

  const handlePatientChange    = (f, v) => setFormData(p => ({ ...p, patient:    { ...p.patient,    [f]: v } }));
  const handleDeliveryChange   = (f, v) => setFormData(p => ({ ...p, delivery:   { ...p.delivery,   [f]: v } }));

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    if (!medicinesFetched) {
      setSearching(true);
      try {
        const { data } = await API.get("/medicines");
        const list = Array.isArray(data) ? data : data.medicines || [];
        setAllMedicines(list);
        setMedicinesFetched(true);
        setSearchResults(list.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
      } catch {
        toast.error("Failed to load medicines");
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(allMedicines.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const addMedication = (med) => {
    if (!prescriptionFile) return toast.error("Please upload prescription first");
    if (formData.medications.find(m => m._id === med._id)) {
      return toast.error("Already added");
    }
    setFormData(p => ({ ...p, medications: [...p.medications, med] }));
    toast.success(`${med.name} added`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeMedication = (id) =>
    setFormData(p => ({ ...p, medications: p.medications.filter(m => m._id !== id) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionFile) return toast.error("Please upload a prescription document");
    if (!formData.medications.length) return toast.error("Add at least one medication");

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("prescriptionImage", prescriptionFile);
      data.append("patient", JSON.stringify(formData.patient));
      data.append("prescriber", JSON.stringify(formData.prescriber));
      data.append("medications", JSON.stringify(formData.medications.map(m => m._id)));
      data.append("delivery", JSON.stringify(formData.delivery));
      data.append("method", "form");

      await API.post("/prescriptions/submit", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Prescription submitted successfully!");
      setFormData(initialState);
      setPrescriptionFile(null);
      setFilePreview(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-black font-medium outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all appearance-none";

  return (
    <div className="bg-white min-h-screen font-sans pb-16 text-black">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-8 py-5 mb-6 shadow-sm shadow-gray-100/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black tracking-tight">New Prescription Form</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Please complete all required fields for submission.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl">
            <CheckCircle size={13} className="text-[#16a34a]" />
            <span className="text-[11px] font-bold text-[#16a34a]">Authorized Prescriber Portal</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Patient Section */}
          <SectionCard icon={User} title="Patient Information">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="First Name" value={formData.patient.firstName} onChange={e => handlePatientChange("firstName", e.target.value)} placeholder="John" required />
              <InputField label="Last Name" value={formData.patient.lastName} onChange={e => handlePatientChange("lastName", e.target.value)} placeholder="Smith" required />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.15em]">Gender</label>
                <select value={formData.patient.gender} onChange={e => handlePatientChange("gender", e.target.value)} className={selectClass}>
                  <option className="bg-white">Male</option>
                  <option className="bg-white">Female</option>
                  <option className="bg-white">Other</option>
                </select>
              </div>

              <InputField label="Date of Birth" type="date" value={formData.patient.dob} onChange={e => handlePatientChange("dob", e.target.value)} required />

              <div className="col-span-2">
                <InputField label="Email Address" type="email" value={formData.patient.email} onChange={e => handlePatientChange("email", e.target.value)} placeholder="patient@example.com" required />
              </div>
              <div className="col-span-2">
                <InputField label="Phone Number" type="tel" value={formData.patient.phone} onChange={e => handlePatientChange("phone", e.target.value)} placeholder="+44 7700 000000" required />
              </div>
              <div className="col-span-2">
                <InputField label="Full Address" value={formData.patient.address} onChange={e => handlePatientChange("address", e.target.value)} placeholder="123 Main Street, London, Postcode" required />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.15em] ml-0.5">Known Allergies / Contraindications</label>
                <textarea
                  value={formData.patient.contraindications}
                  onChange={e => handlePatientChange("contraindications", e.target.value)}
                  placeholder="List conditions, or known allergies (e.g. Penicillin, NSAIDs)..."
                  rows={2}
                  className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 text-sm text-black font-medium transition-all resize-none"
                />
              </div>
            </div>
          </SectionCard>

          <div className="space-y-5">
            {/* Prescription Upload Setup - The Gatekeeper */}
            <SectionCard icon={FileText} title="Step 1: Prescription Document">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.15em]">Upload Signed Copy</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    id="prescription-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPrescriptionFile(file);
                        setFilePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
                      }
                    }}
                  />
                  <label
                    htmlFor="prescription-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${prescriptionFile ? "border-[#22c55e] bg-[#22c55e]/5" : "border-gray-200 hover:bg-[#22c55e]/5 hover:border-[#22c55e]/30"}`}
                  >
                    {prescriptionFile ? (
                      <div className="flex items-center gap-3 px-4 w-full">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                             <FileText size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-black truncate">{prescriptionFile.name}</p>
                          <p className="text-[10px] text-[#16a34a] font-bold">Document Locked in</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); setPrescriptionFile(null); setFilePreview(null); }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={20} className="text-gray-300" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase">Click to upload document</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Medications List - Locked until file is uploaded */}
            <SectionCard 
                icon={Pill} 
                title="Step 2: Medications List" 
                isDisabled={!prescriptionFile}
            >
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  disabled={!prescriptionFile}
                  placeholder={prescriptionFile ? "Search medication name..." : "Upload prescription to unlock..."}
                  className={`w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium transition-all ${prescriptionFile ? "focus:border-[#22c55e] text-black" : "bg-gray-50 cursor-not-allowed text-gray-400"}`}
                  onChange={e => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && prescriptionFile && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl z-50 max-h-44 overflow-y-auto shadow-xl">
                    {searchResults.map(med => (
                      <div key={med._id} onClick={() => addMedication(med)} className="px-4 py-2.5 hover:bg-[#22c55e]/10 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-none">
                        <p className="text-xs font-bold text-black">{med.name}</p>
                        <Plus size={12} className="text-[#22c55e]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {formData.medications.length === 0 && (
                   <p className="text-[10px] text-center text-gray-400 py-2 italic">
                     {prescriptionFile ? "No medications added yet." : "Please upload documentation first."}
                   </p>
                )}
                {formData.medications.map((med) => (
                  <div key={med._id} className="flex items-center justify-between px-3 py-2 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl animate-in fade-in slide-in-from-top-1">
                    <span className="text-xs font-bold text-black">{med.name}</span>
                    <button type="button" onClick={() => removeMedication(med._id)} className="text-red-500 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Delivery Section */}
        <SectionCard icon={Truck} title="Fulfillment & Validity">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#16a34a] uppercase">Method</label>
              <select value={formData.delivery.fulfillmentMethod} onChange={e => handleDeliveryChange("fulfillmentMethod", e.target.value)} className={selectClass}>
                <option className="bg-white">Ship to address</option>
                <option className="bg-white">Clinic collection</option>
              </select>
            </div>
            <InputField label="Delivery Address (If Applicable)" value={formData.delivery.deliveryAddress} onChange={e => handleDeliveryChange("deliveryAddress", e.target.value)} placeholder="Full street address..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#16a34a] uppercase">Prescription Validity</label>
              <select value={formData.delivery.validity} onChange={e => handleDeliveryChange("validity", e.target.value)} className={selectClass}>
                <option className="bg-white">27 days</option>
                <option className="bg-white">14 days</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Bottom Submission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row items-end gap-5 shadow-lg shadow-gray-100/50">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-[#16a34a] uppercase block mb-2">Relevant Medical Notes</label>
            <textarea
              value={formData.patient.allergies}
              rows={2}
              onChange={e => handlePatientChange("allergies", e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#22c55e] text-sm text-black font-medium resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !prescriptionFile}
            className={`w-full md:w-auto px-10 py-4 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${!prescriptionFile ? "bg-gray-300 cursor-not-allowed" : "bg-[#22c55e] hover:bg-[#16a34a] shadow-[#16a34a]/20"}`}
          >
            {submitting ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle size={15} />}
            Confirm & Submit Prescription
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;