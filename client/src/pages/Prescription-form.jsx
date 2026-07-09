import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  User, Stethoscope, FileText, Search, Plus, Trash2,
  CheckCircle, Loader2, AlertCircle, Pill, Truck, ArrowLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 group">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      )}
      <input
        {...props}
        autoComplete="off"
        className={`w-full ${Icon ? "pl-9" : "pl-3.5"} pr-3.5 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium`}
      />
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, color, children }) => {
  const colors = {
    cyan:    { light: "bg-blue-50",    text: "text-blue-600",    border: "border-gray-100" },
    emerald: { light: "bg-emerald-50", text: "text-emerald-600", border: "border-gray-100" },
    violet:  { light: "bg-violet-50",  text: "text-violet-600",  border: "border-gray-100" },
    amber:   { light: "bg-amber-50",   text: "text-amber-600",   border: "border-gray-100" },
    orange:  { light: "bg-orange-50",  text: "text-orange-600",  border: "border-gray-100" },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-5 py-4 border-b ${c.border} flex items-center gap-3 bg-gray-50/50`}>
        <div className={`w-8 h-8 rounded-xl ${c.light} ${c.text} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicinesFetched, setMedicinesFetched] = useState(false);

  const initialState = {
    patient: {
      firstName: "", lastName: "", gender: "Male",
      dob: "", email: "", phone: "", address: "",
      allergies: "", country: "",
    },
    prescriber: {
      name: "", regNumber: "", type: "Doctor",
      clinicName: "", clinicalNotes: "",
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
  const handlePrescriberChange = (f, v) => setFormData(p => ({ ...p, prescriber: { ...p.prescriber, [f]: v } }));
  const handleDeliveryChange   = (f, v) => setFormData(p => ({ ...p, delivery:   { ...p.delivery,   [f]: v } }));

  // State for prescribers
  const [prescribers, setPrescribers] = useState([]);
  const [showPrescribers, setShowPrescribers] = useState(false);

  // Fetch prescribers
  useEffect(() => {
    const fetchPrescribers = async () => {
      try {
        const { data } = await API.get('/users/prescribers');
        setPrescribers(data.prescribers || []);
      } catch (err) {
        console.error('Failed to fetch prescribers:', err);
        toast.error('Failed to load prescribers');
      }
    };
    fetchPrescribers();
  }, []);

  // ── Fetch all medicines once, then filter client-side ─────────
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
        setSearchResults(list.filter(m =>
          m.name.toLowerCase().includes(query.toLowerCase())
        ));
      } catch {
        toast.error("Failed to load medicines");
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(allMedicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase())
      ));
    }
  };

  const addMedication = (med) => {
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

  // Auto-fill prescriber details
  const selectPrescriber = (prescriber) => {
    handlePrescriberChange('name', prescriber.name);
    handlePrescriberChange('regNumber', prescriber.registrationNumber);
    handlePrescriberChange('type', prescriber.professionalRole || 'Doctor');
    handlePrescriberChange('clinicName', prescriber.practiceName || prescriber.clinicName || '');
    // clinicalNotes remains unchanged
    setShowPrescribers(false);
    toast.success('Prescriber selected');
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medications.length) {
      return toast.error("Add at least one medication");
    }

    setSubmitting(true);
    try {
      await API.post("/prescriptions/submit", {
        patient:     formData.patient,
        prescriber:  formData.prescriber,
        medications: formData.medications.map(m => m._id),
        method:      "form",
      });

      toast.success("Prescription submitted successfully!");
      setFormData(initialState);
      setSearchQuery("");
      setSearchResults([]);
      navigate('/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">

      {/* Header */}
      <div className="bg-slate-800 border-b border-gray-100 px-8 py-5 mb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">New Prescription</h1>
            <p className="text-xs text-gray-200 mt-0.5 font-medium">Fill in patient, prescriber, and medication details</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={13} className="text-amber-600" />
            <span className="text-[11px] font-bold text-amber-600">Pending Approval</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Patient Details */}
          <SectionCard icon={User} title="Patient Details" color="cyan">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="First Name" value={formData.patient.firstName} onChange={e => handlePatientChange("firstName", e.target.value)} placeholder="John"  required />
              <InputField label="Last Name"  value={formData.patient.lastName}  onChange={e => handlePatientChange("lastName",  e.target.value)} placeholder="Smith" required />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Gender</label>
                <select value={formData.patient.gender} onChange={e => handlePatientChange("gender", e.target.value)} className={selectClass}>
                  <option className="bg-white">Male</option>
                  <option className="bg-white">Female</option>
                  <option className="bg-white">Other</option>
                </select>
              </div>

              <InputField label="Date of Birth" type="date" value={formData.patient.dob} onChange={e => handlePatientChange("dob", e.target.value)} required />

              <div className="col-span-2">
                <InputField label="Email" type="email" value={formData.patient.email} onChange={e => handlePatientChange("email", e.target.value)} placeholder="patient@email.com" required />
              </div>
              <div className="col-span-2">
                <InputField label="Phone" type="tel" value={formData.patient.phone} onChange={e => handlePatientChange("phone", e.target.value)} placeholder="+44 7700 000000" required />
              </div>
              <div className="col-span-2">
                <InputField label="Address" value={formData.patient.address} onChange={e => handlePatientChange("address", e.target.value)} placeholder="123 Main Street, London" required />
              </div>
              <div className="col-span-2">
                <InputField label="Country" value={formData.patient.country} onChange={e => handlePatientChange("country", e.target.value)} placeholder="UK, USA, India" required />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Allergies / Contraindications</label>
                <textarea
                  value={formData.patient.allergies}
                  onChange={e => handlePatientChange("allergies", e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Latex..."
                  rows={2}
                  className="w-full px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-sm text-gray-900 font-medium placeholder:text-gray-400 transition-all resize-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* Right column */}
          <div className="space-y-5">

            {/* Prescriber Details */}
            <SectionCard icon={Stethoscope} title="Prescriber Details" color="emerald">
              <div className="space-y-3">
                {/* Available prescribers */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescribers(!showPrescribers)}
                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {showPrescribers ? 'Hide' : 'View Available Prescribers'}
                  </button>

                  {showPrescribers && (
                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg No</th>
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional Role</th>
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinic</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {prescribers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-xs">
                                No prescribers available
                              </td>
                            </tr>
                          ) : (
                            prescribers.map(p => (
                              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 font-semibold text-gray-900">{p.name}</td>
                                <td className="px-3 py-2 text-gray-500 font-mono">{p.registrationNumber}</td>
                                <td className="px-3 py-2 text-gray-500">{p.professionalRole || 'N/A'}</td>
                                <td className="px-3 py-2 text-gray-500">{p.practiceName || p.clinicName || 'N/A'}</td>
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() => selectPrescriber(p)}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg transition-colors"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <InputField label="Full Name" value={formData.prescriber.name} onChange={e => handlePrescriberChange("name", e.target.value)} placeholder="Dr. Sarah Connor" required />
                
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Reg. Number" value={formData.prescriber.regNumber} onChange={e => handlePrescriberChange("regNumber", e.target.value)} placeholder="GMC-12345" required />
                  <InputField label="Professional Role" value={formData.prescriber.type} onChange={e => handlePrescriberChange("type", e.target.value)} placeholder="Doctor" required />
                </div>

                <InputField label="Clinic / Practice Name" value={formData.prescriber.clinicName} onChange={e => handlePrescriberChange("clinicName", e.target.value)} placeholder="City Health Clinic" required />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Clinical Notes <span className="normal-case font-medium text-gray-400">(optional)</span></label>
                  <textarea
                    value={formData.prescriber.clinicalNotes}
                    onChange={e => handlePrescriberChange("clinicalNotes", e.target.value)}
                    placeholder="Any additional clinical notes..."
                    rows={2}
                    className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm text-gray-900 font-medium placeholder:text-gray-400 transition-all resize-none"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Medications */}
            <SectionCard icon={Pill} title="Medications" color="violet">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {searching && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-500 animate-spin" />}
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search by medicine name..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all"
                  onChange={e => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                    {searchResults.map(med => (
                      <div key={med._id} onClick={() => addMedication(med)}
                        className="px-4 py-2.5 hover:bg-violet-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{med.name}</p>
                          {med.category && <p className="text-[10px] text-gray-500">{med.category}</p>}
                        </div>
                        <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Plus size={12} className="text-violet-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.medications.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <Pill size={20} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-bold">No medications added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                  {formData.medications.map((med, i) => (
                    <div key={med._id} className="flex items-center justify-between px-3 py-2.5 bg-violet-50 border border-violet-200 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-lg bg-violet-200 text-violet-700 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-xs font-bold text-gray-900">{med.name}</span>
                      </div>
                      <button type="button" onClick={() => removeMedication(med._id)}
                        className="w-6 h-6 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.medications.length > 0 && (
                <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">
                  {formData.medications.length} medication{formData.medications.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Dispensing & Delivery */}
        <SectionCard icon={Truck} title="Dispensing & Delivery" color="orange">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Fulfillment Method</label>
              <select value={formData.delivery.fulfillmentMethod} onChange={e => handleDeliveryChange("fulfillmentMethod", e.target.value)} className={selectClass}>
                <option className="bg-white">Ship direct to the address</option>
                <option className="bg-white">Ship to the clinic</option>
                <option className="bg-white">Patient to collect from the pharmacy</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <InputField label="Delivery Address" value={formData.delivery.deliveryAddress} onChange={e => handleDeliveryChange("deliveryAddress", e.target.value)} placeholder="Enter delivery address" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-0.5">Prescription Validity</label>
              <select value={formData.delivery.validity} onChange={e => handleDeliveryChange("validity", e.target.value)} className={selectClass}>
                <option className="bg-white">27 days</option>
                <option className="bg-white">14 days</option>
                <option className="bg-white">7 days</option>
                <option className="bg-white">Immediate same on day</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Allergies + Submit */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                  <AlertCircle size={13} className="text-amber-600" />
                </div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Known Allergies</label>
              </div>
              <textarea
                value={formData.patient.allergies}
                placeholder="List any known allergies, e.g. Penicillin, Latex, Aspirin..."
                rows={2}
                onChange={e => handlePatientChange("allergies", e.target.value)}
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 text-sm text-gray-900 font-medium placeholder:text-gray-400 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto shrink-0 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                : <><CheckCircle size={15} /> Submit Prescription</>
              }
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PrescriptionForm;