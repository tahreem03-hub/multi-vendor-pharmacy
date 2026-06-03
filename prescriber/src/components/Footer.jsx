import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { MapPin } from "lucide-react";

const Footer = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await API.get('/footer');
        setData(res.data);
      } catch (err) { console.error("Footer fetch failed", err); }
    };
    fetchFooter();
  }, []);

  if (!data) return null;

  return (
    <footer className="bg-slate-900 text-white py-12 px-6 md:px-20 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Logo and Address Section */}
        <div className="space-y-4">
          {data.logo && (
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${data.logo}`} 
              alt="Logo" 
              className="h-24 w-auto object-contain rounded-full bg-slate-100 " 
            />
          )}
          
          <div className="text-white text-md space-y-3 mt-6">
            {Array.isArray(data.addresses) && data.addresses.map((addr, i) => (
              <div key={i} className="flex items-start gap-2 break-words">
                <MapPin size={16} className="text-white shrink-0 mt-0.5" />
                <p className="leading-relaxed">{addr}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Social Links Section */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Follow Us</h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            {Array.isArray(data.socialLinks) && data.socialLinks.map((link, i) => (
              <li key={i}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-indigo-400 transition text-lg"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Regulatory/About Section */}
        <div className="text-gray-300 text-xs sm:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6">About Us</h3>
          <p className="text-sm md:text-md leading-relaxed text-white">{data.regulatoryText}</p>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-xs">
        <p>Copyright © {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;