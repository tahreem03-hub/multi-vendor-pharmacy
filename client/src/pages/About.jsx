import React from 'react';
import { ShieldCheck, Scale, Award, HelpCircle } from 'lucide-react';

const Eyebrow = ({ children }) => (
  <span style={{
    display: 'inline-flex', padding: '4px 14px', borderRadius: '100px',
    fontSize: '11px', fontWeight: '700', color: '#166534',
    background: '#dcfce7', border: '1px solid #bbf7d0',
    marginBottom: '16px', letterSpacing: '0.08em', textTransform: 'uppercase'
  }}>{children}</span>
);

export default function AboutUs() {
  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>

      {/* HERO */}
      <section style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Eyebrow>Licensed UK Pharmacy Operations</Eyebrow>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '44px', fontWeight: '700', letterSpacing: '-1px', color: '#0f172a', marginBottom: '16px' }}>
            Clinical rigour & sourcing security
          </h1>
          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: '1.8', maxWidth: '560px', margin: '0 auto' }}>
            DrGPharma provides dedicated technical interfaces and secure, tracked distribution for medical cosmetic injectors, operating in partnership with Time Pharmacy.
          </p>
        </div>
      </section>

      {/* PHARMACY PARTNERSHIP */}
      <section style={{ padding: '72px 48px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <Eyebrow>Pharmacy Partnership</Eyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
              Healthcare Time Ltd t/a Time Pharmacy
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.8', marginBottom: '24px' }}>
              All prescription medications (POM) and medical consumables ordered via this platform are reviewed, validated, and dispensed under the strict oversight of our registered pharmacy premises.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Award size={18} color="#22c55e" />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>GPhC Registered Premises</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '8px' }}>
                Premises Registration Number: 9010453
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7' }}>
                Fully compliant with the Human Medicines Regulations 2012, operating standard clinical procedures for identity checks and prescription-only safety management.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
                Regulatory Standards
              </h3>
              {[
                { Icon: Scale, title: 'FMD Compliance', desc: 'Every pack features mandatory, serialised security seals preventing grey-market tampering.' },
                { Icon: ShieldCheck, title: 'Cold-Chain Tracking', desc: 'Continuous temperature tracking protects peptide chains from active deterioration during transport.' }
              ].map(({ Icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="#475569" />
                  </span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{title}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '72px 48px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '56px' }}>
            {[
              { num: '229', label: 'Licensed products available' },
              { num: '100%', label: 'FMD-compliant e-prescriptions' },
              { num: 'GPhC', label: 'Registered pharmacy: 9010453' }
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px 28px' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>{s.num}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Eyebrow>Operational Standards</Eyebrow>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '700', color: '#0f172a' }}>
              Traceability and clinical control
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { title: 'Fully validated sourcing', desc: 'We reject secondary grey-market wholesale pipelines. All dermal fillers, consumables, and toxins are sourced directly from validated manufacturers or primary authorised UK distributors.' },
              { title: 'Ledger accountability', desc: 'By integrating order entries with a dynamic financial ledger, we avoid manual bookkeeping errors, keeping input/output tax values and clinical stock numbers verified in real time.' },
              { title: 'Clinical verification', desc: 'Our pharmacists independently verify the registration of every prescribing practitioner (GMC, NMC, GPhC, HCPC) before prescription-only orders are prepared for dispatch.' }
            ].map(c => (
              <div key={c.title}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{c.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.75' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER DISCLOSURE */}
      <section style={{ padding: '56px 48px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <HelpCircle size={28} color="#cbd5e1" style={{ margin: '0 auto 14px' }} />
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
          Clinical inquiries & registration
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.8' }}>
          In accordance with regulatory practices, physical inspections of our dispensing site and licensing registers can be verified via the official General Pharmaceutical Council register using registration number 9010453.
        </p>
      </section>
    </div>
  );
}