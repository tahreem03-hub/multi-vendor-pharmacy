import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Link as LinkIcon, UserCheck,
  Truck, Coins, AlertCircle, ArrowRight, CheckCircle2
} from 'lucide-react';

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-100 mb-4 tracking-wide uppercase">
    {children}
  </span>
);

export default function HowItWorks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prescriber'); // 'prescriber' | 'non-prescriber'

  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* HEADER */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 px-8 lg:px-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <Eyebrow>Workflows & Architecture</Eyebrow>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
            How DrGPharma Works
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            A compliant, dual-track platform for aesthetic prescribers and clinic operators, backed by automated pharmacy fulfillment.
          </p>
        </div>
      </section>

      {/* SECTION 1: CLINICAL PATHS */}
      <section className="py-20 px-8 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Eyebrow>Clinical Access Scenarios</Eyebrow>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">
            Select Your Clinical Registration Type
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Our workflows adapt to your independent prescribing status to ensure full MHRA & GPhC compliance.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('prescriber')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'prescriber'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Verified Prescriber (SwiftRx™)
            </button>
            <button
              onClick={() => setActiveTab('non-prescriber')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'non-prescriber'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Non-Prescriber (PrescribeLink™)
            </button>
          </div>
        </div>

        {/* Tab Content: Prescribers */}
        {activeTab === 'prescriber' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-semibold text-slate-900">
                SwiftRx™ Direct Prescribing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Registered GMC, NMC, GPhC, or GDC practitioners with independent prescribing authority (V300 or equivalent) can issue compliant digital prescriptions in under 2 minutes.
              </p>

              <ul className="space-y-4">
                {[
                  { title: "Identify Patient Details", desc: "Input demographics, allergen profiles, and clinical contraindications directly into the form." },
                  { title: "Select Product Class", desc: "Select prescription items (POM) such as botulinum toxins or standard-rated injectables." },
                  { title: "Compliant Digital Sign-Off", desc: "Submit the secure, paperless prescription directly to our pharmacy team." },
                  { title: "Auto-Linked Checkout", desc: "Proceed immediately to secure payment; orders are queued automatically for dispensing." }
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Prescribing Capabilities</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Workflow Mode: SWIFTRX_DIRECT</p>
                </div>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Direct prescribing of POM & OTC lines</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Customizable prescription validity terms</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Integrated, FMD-compliant patient logs</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Automatic wholesale pre-order triggers</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  * Note: All clinical profiles are audited against active public registers prior to the authorization of prescription-only orders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Non-Prescribers */}
        {activeTab === 'non-prescriber' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-semibold text-slate-900">
                PrescribeLink™ Practitioner Bridge
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Aesthetic therapists and non-prescribing injectors can source prescription items (POM) by linking with a verified prescriber on our network.
              </p>

              <ul className="space-y-4">
                {[
                  { title: "Register Clinic Profile", desc: "Submit your professional credentials (GDC, NMC, etc.) for registration validation." },
                  { title: "Link with a Registered Prescriber", desc: "Send an association request to your independent prescriber's inbox via PrescribeLink™." },
                  { title: "Submit Rx Requests", desc: "Provide required patient consulting documentation, consent files, and clinical logs." },
                  { title: "Prescriber Sign-off & Payment", desc: "Once authorized by your linked prescriber, clear the balance to trigger immediate fulfillment." }
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bridge Framework</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Workflow Mode: PRESCRIBELINK_BRIDGE</p>
                </div>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Supports multiple concurrent prescriber links</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Secure patient consent file uploading (PDF, PNG)</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Independent checkout and delivery coordination</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Comprehensive, compliant audit-trail logging</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  * Note: Non-prescribers cannot order or checkout POM products without active prescriber validation and clinical sign-off.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: FULFILLMENT & ONE-POT MODEL */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-20 px-8 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>Ledger Integration</Eyebrow>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">
              One-Pot Financial & Inventory Framework
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
              How our system tracks every order, stock movement, and VAT adjustment within a single ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <span className="p-3 bg-slate-100 rounded-lg text-slate-700 inline-block">
                <Coins className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-slate-900 text-base">1. Real-Time Balance Division</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The platform segregates your actual cash position from restricted funds (such as VAT obligations owed to HMRC), meaning your available spend is calculated with total precision.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <span className="p-3 bg-slate-100 rounded-lg text-slate-700 inline-block">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-slate-900 text-base">2. Product-Specific VAT Logic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toxins (such as Azzalure) dispensed against valid medical prescriptions are processed as zero-rated, while other injectables are standard-rated. The ledger tracks input-output VAT variances instantly.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <span className="p-3 bg-slate-100 rounded-lg text-slate-700 inline-block">
                <Truck className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-slate-900 text-base">3. Flexible Fulfillment Modes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Orders are handled as either shelf stock, pre-ordered wholesale items, or hybrid splits. The ledger adjusts your physical asset valuation the moment a parcel leaves the warehouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: COLD-CHAIN CUSTODY */}
      <section className="py-20 px-8 lg:px-24 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden border border-white/5">
          {/* Accent glows */}
          <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[260px] h-[260px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/20 tracking-wider uppercase">
              Cold-Chain Safety Note
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Preserving Formulation Activity
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Botulinum toxins and specific GLP-1 weight-management treatments are strictly temperature-sensitive. To protect product safety and comply with pharmacy standards, these items require validated, temperature-controlled packaging.
            </p>
            <div className="flex items-start gap-3 bg-white/5 border border-teal-500/20 p-4 rounded-xl backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Chilled products are packaged in validated insulated containers containing logged coolant packs. Orders containing cold-chain items are shipped exclusively via tracked next-day delivery (Monday through Thursday) to guarantee safe arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 px-8 lg:px-24 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h3 className="font-serif text-2xl font-semibold text-slate-900">
            Ready to Begin Clinical Ordering?
          </h3>
          <p className="text-slate-600 text-sm">
            Access secure, compliant, and tracked prescription medical distribution today.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-teal-950 hover:bg-teal-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm px-6 py-3 rounded-xl transition-all"
            >
              Log In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}