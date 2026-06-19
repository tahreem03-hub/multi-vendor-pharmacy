import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 mb-4 tracking-wide uppercase">
    {children}
  </span>
);

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionalReg: '', // GMC, NMC, HCPC etc.
    subject: 'General Inquiry',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API form submission
    setTimeout(() => {
      toast.success("Query submitted successfully.");
      setFormData({
        name: '',
        email: '',
        professionalReg: '',
        subject: 'General Inquiry',
        message: ''
      });
      setSending(false);
    }, 1200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white text-slate-900 font-sans">
      
      {/* HEADER */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 px-8 lg:px-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 1px' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Eyebrow>Clinical Help Desk</Eyebrow>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
            Contact Our Pharmacy Team
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Contact our registered pharmacists directly for clinical concerns, account verification queries, or delivery updates.
          </p>
        </div>
      </section>

      {/* CORE CONTACT LAYOUT */}
      <section className="py-20 px-8 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Physical Coordinates & Operational Windows */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-slate-900">
                Pharmacy Premises & Verification
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Operating in full compliance with registered UK pharmacy standards. Direct verification is accessible via the GPhC register.
              </p>
            </div>

            {/* Coordinates list */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registered Dispensary</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Time Pharmacy<br />
                    [Insert Registered Business Address Details]<br />
                    United Kingdom
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">GPhC Premises No: 9010453</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Operational Hours</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Monday – Friday: 09:00 to 18:00<br />
                    Saturday – Sunday: Closed
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">POM Cut-off: 15:00 for same-day dispatch</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Phone Lines</h4>
                  <p className="text-xs text-slate-600 mt-1">+44 (0) 20 0000 0000</p>
                  <p className="text-[10px] text-slate-400">Clinical queries / Prescriber validation desk</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Email Channels</h4>
                  <p className="text-xs text-slate-600 mt-1">support@drgpharma.com</p>
                  <p className="text-[10px] text-slate-400">Submit scanned manual Rx forms here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-6">
              Submit an Inquiry
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Dr / Nurse / Practitioner"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Registration No. (Optional)</label>
                  <input
                    type="text"
                    name="professionalReg"
                    value={formData.professionalReg}
                    onChange={handleInputChange}
                    placeholder="e.g. GPhC / GMC / NMC"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Topic</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
                  >
                    <option>General Inquiry</option>
                    <option>Account Validation & Verification</option>
                    <option>SwiftRx™ Prescription Help</option>
                    <option>Fulfillment & Cold-Chain Delivery</option>
                    <option>Regulatory/Audit Request</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Message Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Detail your inquiry clearly so our pharmacy team can assist."
                  className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-teal-950 hover:bg-teal-800 disabled:bg-slate-300 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {sending ? 'Submitting...' : 'Submit Form'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* COMPLIANCE FOOTNOTE */}
      <section className="bg-slate-50 border-t border-slate-200 py-10 px-8 text-center text-xs text-slate-500">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Form data processed in accordance with clinical privacy standards and SSL data encryption.</span>
        </div>
      </section>
    </div>
  );
}