import { useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Stethoscope, Pill, Truck, CreditCard,
  Search, Plus, Minus, Trash2, CheckCircle, Loader2, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const inputCls = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-300 outline-none focus:border-black transition-all font-medium';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block';

// ── Cold-chain signal — MUST match issuePrescriptionController.needsColdChain ──
const COLD_CHAIN_CATEGORIES = ['Botulinum Toxins', 'GLP-1', 'GLP-1 Injectables', 'Injectables'];
const needsColdChain = (m) =>
  m?.requiresColdChain === true || COLD_CHAIN_CATEGORIES.includes(m?.category);

const Field = ({ label, children }) => (
  <div className="flex flex-col">
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
        <Icon size={15} className="text-gray-500" />
      </div>
      <h2 className="text-sm font-semibold text-black">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const PrescriberIssuePrescription = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // logged-in prescriber — source of truth, never editable here

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicinesFetched, setMedicinesFetched] = useState(false);
  const [selectedMeds, setSelectedMeds] = useState([]); // each med carries a `quantity`

  const [patient, setPatient] = useState({
    firstName: '', lastName: '', gender: 'Male', dob: '',
    email: '', phone: '', address: '', allergies: '', country: '',
  });
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [delivery, setDelivery] = useState({
    fulfillmentMethod: 'Ship to patient',
    prescriptionValidity: '28 days',
    deliveryMethod: 'Standard',
    line1: '', city: '', postcode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const handlePatient = (f, v) => setPatient(p => ({ ...p, [f]: v }));
  const handleDelivery = (f, v) => setDelivery(p => ({ ...p, [f]: v }));

  const requiresColdChain = selectedMeds.some(needsColdChain);
  const busy = submitting || savingDraft;

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    if (!medicinesFetched) {
      setSearching(true);
      try {
        const { data } = await API.get('/medicines');
        const list = Array.isArray(data) ? data : data.medicines || [];
        setAllMedicines(list);
        setMedicinesFetched(true);
        setSearchResults(list.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
      } catch {
        toast.error('Failed to load medicines');
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(allMedicines.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const addMed = (med) => {
    if (selectedMeds.find(m => m._id === med._id)) return toast.error('Already added');
    setSelectedMeds(p => [...p, { ...med, quantity: 1 }]);
    setSearchQuery(''); setSearchResults([]);
  };
  const removeMed = (id) => setSelectedMeds(p => p.filter(m => m._id !== id));
  const setQty = (id, delta) =>
    setSelectedMeds(p => p.map(m =>
      m._id === id ? { ...m, quantity: Math.max(1, (m.quantity || 1) + delta) } : m
    ));
  const setQtyDirect = (id, val) => {
    const n = Math.max(1, parseInt(val, 10) || 1);
    setSelectedMeds(p => p.map(m => (m._id === id ? { ...m, quantity: n } : m)));
  };

  // Shared submit for both "Issue" and "Save as Draft"
  const submit = async (saveAsDraft) => {
    if (!patient.firstName || !patient.lastName) return toast.error('Enter patient name');

    if (!saveAsDraft) {
      if (!patient.dob || !patient.email) return toast.error('Date of birth and email are required to issue');
      if (!selectedMeds.length) return toast.error('Add at least one medication');
      if (requiresColdChain && delivery.deliveryMethod !== 'Cold-Chain Express') {
        return toast.error('Botulinum toxins & GLP-1 items require Cold-Chain Express delivery');
      }
    }

    saveAsDraft ? setSavingDraft(true) : setSubmitting(true);
    try {
      const { data } = await API.post('/prescriptions/issue', {
        patientDetails: patient,
        medications: selectedMeds.map(m => m._id),
        items: selectedMeds.map(m => ({ medicineId: m._id, quantity: m.quantity || 1 })),
        clinicalNotes,
        fulfillmentMethod: delivery.fulfillmentMethod,
        prescriptionValidity: delivery.prescriptionValidity,
        deliveryMethod: delivery.deliveryMethod,
        deliveryAddress: { line1: delivery.line1, city: delivery.city, postcode: delivery.postcode },
        paymentMethod,
        saveAsDraft,
      });

      if (saveAsDraft) {
        toast.success('Draft saved');
      } else {
        toast.success(`Issued — ${data.rxReference || data.orderReference}`);
      }
      navigate(`/dashboard?page=prescriptions&prescriptionId=${data.prescriptionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      saveAsDraft ? setSavingDraft(false) : setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-lg font-bold text-gray-900">Issue Prescription</h1>
        <p className="text-xs text-gray-400 mt-1">Issues immediately under your account — no approval step</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="max-w-5xl mx-auto space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Patient Details */}
          <Card icon={User} title="Patient Details">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input className={inputCls} required value={patient.firstName}
                    onChange={e => handlePatient('firstName', e.target.value)} />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} required value={patient.lastName}
                    onChange={e => handlePatient('lastName', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender">
                  <select className={selectCls} value={patient.gender}
                    onChange={e => handlePatient('gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth">
                  <input type="date" className={inputCls} required value={patient.dob}
                    onChange={e => handlePatient('dob', e.target.value)} />
                </Field>
              </div>
              <Field label="Email">
                <input type="email" className={inputCls} required value={patient.email}
                  onChange={e => handlePatient('email', e.target.value)} />
              </Field>
              <Field label="Phone">
                <input type="tel" className={inputCls} required value={patient.phone}
                  onChange={e => handlePatient('phone', e.target.value)} />
              </Field>
              <Field label="Address">
                <input className={inputCls} required value={patient.address}
                  onChange={e => handlePatient('address', e.target.value)} />
              </Field>
              <Field label="Allergies / Contraindications">
                <textarea rows={2} className={`${inputCls} resize-none`}
                  value={patient.allergies}
                  onChange={e => handlePatient('allergies', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-5">

            {/* Prescriber Details — READ ONLY, from account */}
            <Card icon={Stethoscope} title="Prescriber Details">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Name</span>
                  <span className="font-semibold text-black">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Reg. Number</span>
                  <span className="font-semibold text-black">{user?.registrationNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Professional Role</span>
                  <span className="font-semibold text-black">{user?.professionalRole || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Practice</span>
                  <span className="font-semibold text-black">{user?.practiceName || '—'}</span>
                </div>
                <p className="text-[10px] text-gray-300 pt-2">
                  Auto-populated from your verified account — cannot be edited here.
                </p>
              </div>
              <div className="mt-3">
                <Field label="Clinical Notes (optional)">
                  <textarea rows={2} className={`${inputCls} resize-none`}
                    value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} />
                </Field>
              </div>
            </Card>

            {/* Medications */}
            <Card icon={Pill} title="Prescribe Medications / Products">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                {searching && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                <input value={searchQuery} onChange={e => handleSearch(e.target.value)}
                  placeholder="Search products..." className={`${inputCls} pl-9`} />
                {searchResults.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                    {searchResults.map(med => (
                      <div key={med._id} onClick={() => addMed(med)}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-xs font-semibold text-black">{med.name}</p>
                          {needsColdChain(med) && (
                            <p className="text-[9px] text-sky-600 font-bold uppercase tracking-wide">❄ cold-chain</p>
                          )}
                        </div>
                        <Plus size={12} className="text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedMeds.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <Pill size={18} className="mx-auto text-gray-200 mb-1.5" />
                  <p className="text-xs text-gray-300 font-medium">No products added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedMeds.map((med, i) => (
                    <div key={med._id} className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <span className="text-xs font-semibold text-black truncate">{i + 1}. {med.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* qty stepper */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <button type="button" onClick={() => setQty(med._id, -1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                            disabled={(med.quantity || 1) <= 1}>
                            <Minus size={12} />
                          </button>
                          <input
                            value={med.quantity || 1}
                            onChange={e => setQtyDirect(med._id, e.target.value)}
                            className="w-9 text-center text-xs font-bold text-black outline-none"
                            inputMode="numeric"
                          />
                          <button type="button" onClick={() => setQty(med._id, 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeMed(med._id)} className="p-1 text-gray-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {requiresColdChain && (
                <p className="text-[10px] text-amber-600 font-semibold mt-2">
                  ⚠ Contains items requiring Cold-Chain Express delivery
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Dispensing & Delivery */}
        <Card icon={Truck} title="Dispensing & Delivery">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Fulfillment Method">
              <select className={selectCls} value={delivery.fulfillmentMethod}
                onChange={e => handleDelivery('fulfillmentMethod', e.target.value)}>
                <option>Ship to patient</option>
                <option>Ship to clinic</option>
                <option>Patient collects from Time Pharmacy</option>
              </select>
            </Field>
            <Field label="Prescription Validity">
              <select className={selectCls} value={delivery.prescriptionValidity}
                onChange={e => handleDelivery('prescriptionValidity', e.target.value)}>
                <option>28 days</option><option>14 days</option><option>7 days</option>
                <option>Immediate (same-day dispatch)</option>
              </select>
            </Field>
          </div>

          <Field label="Delivery Option">
            <select className={selectCls} value={delivery.deliveryMethod}
              onChange={e => handleDelivery('deliveryMethod', e.target.value)}>
              <option>Standard</option>
              <option>Next Day</option>
              <option>Cold-Chain Express</option>
              <option>Click & Collect</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <Field label="Address Line 1">
              <input className={inputCls} value={delivery.line1}
                onChange={e => handleDelivery('line1', e.target.value)} />
            </Field>
            <Field label="City">
              <input className={inputCls} value={delivery.city}
                onChange={e => handleDelivery('city', e.target.value)} />
            </Field>
            <Field label="Postcode">
              <input className={inputCls} value={delivery.postcode}
                onChange={e => handleDelivery('postcode', e.target.value)} />
            </Field>
          </div>
        </Card>

        {/* Payment */}
        <Card icon={CreditCard} title="Payment Method">
          <div className="grid grid-cols-3 gap-3">
            {['Card', 'Bank Transfer', 'Credit Account'].map(pm => (
              <button type="button" key={pm} onClick={() => setPaymentMethod(pm)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                  paymentMethod === pm ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {pm}
              </button>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" onClick={() => submit(true)} disabled={busy}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50">
            {savingDraft
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><Save size={15} /> Save as Draft</>}
          </button>
          <button type="submit" disabled={busy}
            className="px-8 py-3 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50">
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Issuing...</>
              : <><CheckCircle size={15} /> Issue Prescription & Order Dispensing</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriberIssuePrescription;