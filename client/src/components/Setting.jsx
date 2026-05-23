import { useState } from 'react';
import Header from './Header';
import toast from 'react-hot-toast';

const Setting = () => {
  const [pharmacyForm, setPharmacyForm] = useState({
    name:       'Healthcare Time Ltd t/a Time Pharmacy',
    gphc:       '9010453',
    pharmacist: '',
  });

  const [financialForm, setFinancialForm] = useState({
    paymentRate: '1.5',
    vatRate:     '20',
    packaging:   '2.50',
    delivery:    '5.00',
  });

  const [savingPharmacy,  setSavingPharmacy]  = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);

  const handleSavePharmacy = async () => {
    setSavingPharmacy(true);
    try {
      localStorage.setItem('pharmacySettings', JSON.stringify(pharmacyForm));
      toast.success('Pharmacy details saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSavingPharmacy(false);
    }
  };

  const handleSaveFinancial = async () => {
    setSavingFinancial(true);
    try {
      localStorage.setItem('financialSettings', JSON.stringify(financialForm));
      toast.success('Financial settings saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSavingFinancial(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-blue-900">
      <Header title="Settings" />
      <div className="p-6 max-w-7xl mx-auto">

        {/* Title Section */}
        <div className="mb-8 border-b border-blue-50 pb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            System Settings
          </h1>
          <p className="text-blue-450 text-md mt-1">
            Configure pharmacy identity and financial parameters <br /> for automated commission calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Pharmacy Details */}
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-md font-bold uppercase tracking-widest text-blue-550">Pharmacy Details</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Pharmacy Name', key: 'name', type: 'text' },
                { label: 'GPhC Registration', key: 'gphc', type: 'text' },
                { label: 'Responsible Pharmacist', key: 'pharmacist', type: 'text', placeholder: 'Enter name' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={pharmacyForm[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setPharmacyForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={handleSavePharmacy}
                disabled={savingPharmacy}
                className="mt-2 px-6 py-3 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {savingPharmacy ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </div>

          {/* Three-Pot Financial Settings */}
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-md font-bold uppercase tracking-widest text-blue-550">Financial Rules</h2>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-[9px] leading-relaxed">
                <span className="font-bold uppercase mr-1">Policy:</span> 
                Dr G retains 100% of net margin. Time Pharmacy is reimbursed exact costs only 
                (COGS + packaging + delivery).
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Payment Rate (%)</label>
                  <input
                    type="number" step="0.1"
                    value={financialForm.paymentRate}
                    onChange={e => setFinancialForm(f => ({ ...f, paymentRate: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={financialForm.vatRate}
                    onChange={e => setFinancialForm(f => ({ ...f, vatRate: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Packaging (£)</label>
                  <input
                    type="number" step="0.01"
                    value={financialForm.packaging}
                    onChange={e => setFinancialForm(f => ({ ...f, packaging: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Delivery (£)</label>
                  <input
                    type="number" step="0.01"
                    value={financialForm.delivery}
                    onChange={e => setFinancialForm(f => ({ ...f, delivery: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveFinancial}
                disabled={savingFinancial}
                className="mt-2 px-6 py-3 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {savingFinancial ? 'Saving...' : 'Save Financials'}
              </button>
            </div>
          </div>

          {/* Environment Info */}
          <div className="lg:col-span-2 border border-blue-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-blue-550 mb-4">Environment Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'API Endpoints', value: import.meta.env.VITE_API_URL || 'http://localhost:4000' },
                { label: 'System Mode',   value: import.meta.env.MODE || 'development' },
                { label: 'Core Version',  value: '1.0.0-stable' },
              ].map((item, i) => (
                <div key={i} className="bg-blue-50/20 border border-blue-50 rounded-lg p-3">
                  <p className="text-[13px] font-bold uppercase text-blue-500 mb-1">{item.label}</p>
                  <p className="text-xs font-medium text-blue-800 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Setting;