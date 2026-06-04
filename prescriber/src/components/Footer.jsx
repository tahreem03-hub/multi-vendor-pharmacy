import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react';

// ── Fallback footer shown when no CMS data is available ──────
const FallbackFooter = () => (
  <footer className="bg-[#02353C] text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
    <div className="max-w-7xl mx-auto px-6 md:px-16 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      {/* Brand */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Doctor<span className="text-emerald-400">G</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Professional aesthetic medicine supplier. Regulated products, expert guidance.
        </p>
        <div className="flex items-start gap-2 text-slate-300 text-sm">
          <MapPin size={15} className="shrink-0 mt-0.5 text-emerald-400" />
          <span>United Kingdom</span>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Quick Links</h3>
        <ul className="space-y-2.5 text-sm text-slate-300">
          {['Home', 'Injectables', 'Skincare', 'About', 'Contact'].map(link => (
            <li key={link}>
              <a href={`/${link.toLowerCase()}`} className="hover:text-white transition-colors">{link}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Contact</h3>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <Mail size={14} className="text-emerald-400 shrink-0" />
            <span>info@doctorg.co.uk</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone size={14} className="text-emerald-400 shrink-0" />
            <span>+44 (0) 800 000 0000</span>
          </li>
        </ul>
      </div>

      {/* Regulatory */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Regulatory</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          All products are supplied for professional use only. By purchasing, you confirm you are a registered healthcare professional. Not for resale to the general public.
        </p>
      </div>
    </div>

    <div className="border-t border-white/10 py-5 text-center text-slate-500 text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
      © {new Date().getFullYear()} DoctorG. All rights reserved.
    </div>
  </footer>
);

// ── CMS-driven footer ─────────────────────────────────────────
const Footer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/footer')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data) return <FallbackFooter />;

  return (
    <footer className="bg-[#02353C] text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand / Logo */}
        <div className="space-y-4">
          {data.logo ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${data.logo}`}
              alt="Logo"
              className="h-16 w-auto object-contain rounded-xl bg-white/10 p-2"
            />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight">
              Doctor<span className="text-emerald-400">G</span>
            </h2>
          )}

          {Array.isArray(data.addresses) && data.addresses.length > 0 && (
            <div className="space-y-2 mt-2">
              {data.addresses.map((addr, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{addr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-slate-300">
            {['Home', 'Injectables', 'Skincare', 'About', 'Contact'].map(link => (
              <li key={link}>
                <a href={`/${link.toLowerCase()}`} className="hover:text-white transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        {Array.isArray(data.socialLinks) && data.socialLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Follow Us</h3>
            <ul className="space-y-3">
              {data.socialLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    <span className="text-emerald-400"><Globe size={16} /></span>
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Regulatory */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-5">Regulatory</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {data.regulatoryText || 'All products are supplied for professional use only. By purchasing, you confirm you are a registered healthcare professional.'}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} DoctorG. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
