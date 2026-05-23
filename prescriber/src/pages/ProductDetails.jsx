import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [adding, setAdding] = useState(false);
  const [orderType, setOrderType] = useState('Prescription');
  const [patientQuery, setPatientQuery] = useState('');
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    mobileNumber: '',
    personalEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: '',
  });
  const [directions, setDirections] = useState('');
  const [sendTo, setSendTo] = useState('clinic');

  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/medicines/${id}`);
        const data = response.data.medicine || response.data;
        setProduct(data);
        setActiveImage(data.image || data.primaryImage);
        setOrderType(data.prescriptionRequired ? 'Prescription' : 'Stock Medicine');
        setSendTo('clinic');
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const directToPatientAllowed = Boolean(
    product?.directToPatientAllowed ||
    product?.allowDirectToPatient ||
    product?.sendToPatientAllowed ||
    product?.allowPatientDelivery
  );

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} units available`);
      return;
    }

    if (orderType === 'Prescription' && !selectedPatient) {
      toast.error('Please select or create a patient before adding a prescription.');
      return;
    }

    setAdding(true);
    try {
      await addToCart({
        ...product,
        quantity,
        orderType,
        directions,
        sendTo,
        patient: selectedPatient || null,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handlePrescriptionRedirect = () => {
    navigate('/prescription-form');
  };

  const handlePatientQueryChange = (value) => {
    setPatientQuery(value);
    setSelectedPatient(null);
    setPatientOptions([]);
    setPatientSearchLoading(false);
    setCreatingPatient(false);
  };

  const handleCreatePatientChange = (field, value) => {
    setNewPatientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientQuery(`${patient.firstName} ${patient.lastName}`);
    setPatientOptions([]);
    setCreatingPatient(false);
  };

  const handleNewPatientSubmit = async () => {
    if (!newPatientData.firstName || !newPatientData.lastName) {
      toast.error('Please provide first and last name.');
      return;
    }

    try {
      const { data } = await API.post('/patients', newPatientData);
      const patient = data.patient || data;
      setSelectedPatient(patient);
      setPatientQuery(`${patient.firstName} ${patient.lastName}`);
      setPatientOptions([]);
      setCreatingPatient(false);
      setNewPatientData({
        firstName: '',
        lastName: '',
        dob: '',
        mobileNumber: '',
        personalEmail: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        county: '',
        postcode: '',
        country: '',
      });
      toast.success('Patient created successfully');
    } catch (error) {
      console.error('Create patient failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create patient');
    }
  };

  useEffect(() => {
    if (creatingPatient) return;
    if (patientQuery.length < 3) return;

    const timer = setTimeout(async () => {
      setPatientSearchLoading(true);
      try {
        const response = await API.get(`/patients?search=${encodeURIComponent(patientQuery)}`);
        const data = Array.isArray(response.data) ? response.data : response.data.patients || [];
        setPatientOptions(data);
      } catch (error) {
        console.error('Patient search failed:', error);
        setPatientOptions([]);
      } finally {
        setPatientSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientQuery, creatingPatient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-600" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 font-bold">Product not found.</div>;
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://localhost:4000/${cleanPath}`;
  };

  const extraImages = product.additionalImages || product.images || [];
  const allImages = [product.image || product.primaryImage, ...extraImages].filter(Boolean);
  const selectedPatientAddress = selectedPatient
    ? [
        selectedPatient.addressLine1,
        selectedPatient.addressLine2,
        [selectedPatient.city, selectedPatient.postcode].filter(Boolean).join(', '),
        selectedPatient.country,
      ].filter(Boolean)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white font-poppins">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-6 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100 aspect-square overflow-hidden">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className="max-h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto py-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                  activeImage === img
                    ? 'border-cyan-500 scale-105 shadow-md'
                    : 'border-transparent bg-gray-50 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`View ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-4">
            {product.prescriptionRequired ? (
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-red-100 w-fit mb-2">
                <FileText size={12} /> Prescription Required
              </span>
            ) : (
              <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-green-100 w-fit mb-2">
                OTC — No Prescription
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <span>
                SKU: <span className="text-slate-900 font-semibold text-sm">{product.sku || 'N/A'}</span>
              </span>
              <span>
                Stock: <span className="text-slate-900 font-semibold text-sm">{product.stock || 0} units</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Per Unit Price</label>
              <span className="text-lg font-bold text-gray-900">
                £{(product.sellingPrice || product.price || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {product.prescriptionRequired && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                This is a prescription-only medicine. You must submit a valid prescription before your order can be dispensed.
                <button onClick={handlePrescriptionRedirect} className="ml-1 font-bold underline">
                  Submit prescription →
                </button>
              </p>
            </div>
          )}

          <div className="space-y-5 mt-auto">
            <div className="grid grid-cols-2 gap-3">
              {['Prescription', 'Stock Medicine'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${orderType === type ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {orderType === 'Prescription'
                ? 'By selecting Prescription request type you are confirming that this item will be prescribed purely for medical purposes.'
                : 'By selecting Stock Medicine you are creating a Signed Order which will require a prescriber signature before it can be dispatched.'}
            </p>

            {orderType === 'Prescription' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select Patient</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patientQuery}
                        onChange={(e) => handlePatientQueryChange(e.target.value)}
                        placeholder="Search for a patient"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
                      {(patientOptions.length > 0 || patientSearchLoading) && (
                        <div className="absolute z-30 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                          {patientOptions.length > 0 ? (
                            patientOptions.map((patient) => (
                              <button
                                key={patient._id}
                                type="button"
                                onClick={() => handleSelectPatient(patient)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-100 transition"
                              >
                                <div className="font-semibold text-sm text-slate-900">{patient.firstName} {patient.lastName}</div>
                                <div className="text-[11px] text-slate-500">{patient.personalEmail || patient.mobileNumber || 'No contact'}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              {patientSearchLoading ? 'Searching patients...' : 'No patients found.'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!creatingPatient && (
                    <button
                      type="button"
                      onClick={() => { setCreatingPatient(true); setSelectedPatient(null); }}
                      className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      Create New Patient
                    </button>
                  )}

                  {creatingPatient && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <input value={newPatientData.firstName} onChange={(e) => handleCreatePatientChange('firstName', e.target.value)} placeholder="First Name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.lastName} onChange={(e) => handleCreatePatientChange('lastName', e.target.value)} placeholder="Last Name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input type="date" value={newPatientData.dob} onChange={(e) => handleCreatePatientChange('dob', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.personalEmail} onChange={(e) => handleCreatePatientChange('personalEmail', e.target.value)} placeholder="Personal email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.mobileNumber} onChange={(e) => handleCreatePatientChange('mobileNumber', e.target.value)} placeholder="Mobile phone" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-3">
                          <input value={newPatientData.addressLine1} onChange={(e) => handleCreatePatientChange('addressLine1', e.target.value)} placeholder="Address Line 1" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.addressLine2} onChange={(e) => handleCreatePatientChange('addressLine2', e.target.value)} placeholder="Address Line 2" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.city} onChange={(e) => handleCreatePatientChange('city', e.target.value)} placeholder="City" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <input value={newPatientData.county} onChange={(e) => handleCreatePatientChange('county', e.target.value)} placeholder="County" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          <div className="grid grid-cols-2 gap-3">
                            <input value={newPatientData.postcode} onChange={(e) => handleCreatePatientChange('postcode', e.target.value)} placeholder="Postcode" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                            <input value={newPatientData.country} onChange={(e) => handleCreatePatientChange('country', e.target.value)} placeholder="Country" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button type="button" onClick={handleNewPatientSubmit} className="flex-1 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition-all">Create Patient</button>
                        <button type="button" onClick={() => setCreatingPatient(false)} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">Cancel</button>
                      </div>
                    </div>
                  )}

                  {selectedPatient && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mt-2 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">Selected Patient</div>
                      <div className="mt-2 text-xs text-slate-600">
                        <div>{selectedPatient.firstName} {selectedPatient.lastName}</div>
                        {selectedPatient.personalEmail && <div>{selectedPatient.personalEmail}</div>}
                        {selectedPatient.mobileNumber && <div>{selectedPatient.mobileNumber}</div>}
                        {selectedPatient.dob && <div>DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</div>}
                        {selectedPatientAddress.length > 0 && (
                          <div className="pt-2 border-t border-slate-200">
                            {selectedPatientAddress.map((line, idx) => (<div key={idx}>{line}</div>))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Send To</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSendTo('clinic')} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${sendTo === 'clinic' ? 'bg-black text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}>My Clinic</button>
                <button type="button" onClick={() => directToPatientAllowed && setSendTo('patient')} disabled={!directToPatientAllowed} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${sendTo === 'patient' ? 'bg-black text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'} ${!directToPatientAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}>Direct to Patient</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
                <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 hover:bg-slate-100">−</button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((prev) => prev + 1)} className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 hover:bg-slate-100">+</button>
              </div>
              <button type="button" onClick={handleAddToCart} disabled={adding || product.stock < quantity} className="flex-1 w-full rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;