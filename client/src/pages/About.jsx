import React from 'react';
import { ShieldCheck, Scale, Award, HelpCircle } from 'lucide-react';

const HEAD = 'Fraunces, Georgia, serif';
const BODY = 'Inter, system-ui, sans-serif';

const Eyebrow = ({ children }) => (
  <span 
    className="inline-flex px-3.5 py-1 rounded-full text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 mb-4 tracking-wider uppercase"
  >
    {children}
  </span>
);

export default function AboutUs() {
  return (
    <div className="bg-white text-slate-900 min-h-screen" style={{ fontFamily: BODY }}>

      {/* HERO */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 px-6 md:px-12 text-center relative overflow-hidden">
        {/* Radial background pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="max-w-2xl mx-auto relative z-10">
          <Eyebrow>Licensed UK Pharmacy Operations</Eyebrow>
          <h1 
            className="text-4xl md:text-[44px] font-semibold tracking-tight text-slate-900 mb-4"
            style={{ fontFamily: HEAD }}
          >
            Clinical rigour & sourcing security
          </h1>
          <p className="text-[17px] text-slate-500 leading-relaxed max-w-xl mx-auto">
            DrGPharma provides dedicated technical interfaces and secure, tracked distribution for medical cosmetic injectors, operating in partnership with Time Pharmacy.
          </p>
        </div>
      </section>

      {/* PHARMACY PARTNERSHIP */}
      <section className="py-18 md:py-20 px-6 md:px-12 max-w-[1080px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow>Pharmacy Partnership</Eyebrow>
            <h2 
              className="text-3xl font-semibold text-slate-900 mb-3.5"
              style={{ fontFamily: HEAD }}
            >
              Healthcare Time Ltd t/a Time Pharmacy
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              All prescription medications (POM) and medical consumables ordered via this platform are reviewed, validated, and dispensed under the strict oversight of our registered pharmacy premises.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Award size={18} className="text-teal-600" />
                <span className="text-sm font-bold text-slate-900">GPhC Registered Premises</span>
              </div>
              <span className="font-mono text-xs text-slate-400 mb-2 block">
                Premises Registration Number: 9010453
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fully compliant with the Human Medicines Regulations 2012, operating standard clinical procedures for identity checks and prescription-only safety management.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3.5 mb-5">
                Regulatory Standards
              </h3>
              {[
                { 
                  Icon: Scale, 
                  title: 'FMD Compliance', 
                  desc: 'Every pack features mandatory, serialised security seals preventing grey-market tampering.' 
                },
                { 
                  Icon: ShieldCheck, 
                  title: 'Cold-Chain Tracking', 
                  desc: 'Continuous temperature tracking protects peptide chains from active deterioration during transport.' 
                }
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex gap-4 mb-5 last:mb-0">
                  <span className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-cyan-600" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS & OPERATIONS */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-18 px-6 md:px-12">
        <div className="max-w-[1080px] mx-auto">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { num: '229', label: 'Licensed products available' },
              { num: '100%', label: 'FMD-compliant e-prescriptions' },
              { num: 'GPhC', label: 'Registered pharmacy: 9010453' }
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-6 md:px-7">
                <div 
                  className="text-4xl font-semibold text-teal-600 mb-1"
                  style={{ fontFamily: HEAD }}
                >
                  {s.num}
                </div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* SECTION HEADER */}
          <div className="text-center mb-10">
            <Eyebrow>Operational Standards</Eyebrow>
            <h2 
              className="text-3xl font-semibold text-slate-900"
              style={{ fontFamily: HEAD }}
            >
              Traceability and clinical control
            </h2>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Fully validated sourcing', 
                desc: 'We reject secondary grey-market wholesale pipelines. All dermal fillers, consumables, and toxins are sourced directly from validated manufacturers or primary authorised UK distributors.' 
              },
              { 
                title: 'Ledger accountability', 
                desc: 'By integrating order entries with a dynamic financial ledger, we avoid manual bookkeeping errors, keeping input/output tax values and clinical stock numbers verified in real time.' 
              },
              { 
                title: 'Clinical verification', 
                desc: 'Our pharmacists independently verify the registration of every prescribing practitioner (GMC, NMC, GPhC, HCPC) before prescription-only orders are prepared for dispatch.' 
              }
            ].map(c => (
              <div key={c.title}>
                <div className="w-2 h-2 rounded-full bg-teal-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER DISCLOSURE */}
      <section className="py-14 px-6 md:px-12 max-w-2xl mx-auto text-center">
        <HelpCircle size={28} className="text-slate-300 mx-auto mb-3.5" />
        <h3 
          className="text-2xl font-semibold text-slate-900 mb-2.5"
          style={{ fontFamily: HEAD }}
        >
          Clinical inquiries & registration
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          In accordance with regulatory practices, physical inspections of our dispensing site and licensing registers can be verified via the official General Pharmaceutical Council register using registration number 9010453.
        </p>
      </section>
    </div>
  );
}