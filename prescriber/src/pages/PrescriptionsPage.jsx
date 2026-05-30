import React, { useState } from 'react';
import { Pencil, Link as LinkIcon } from 'lucide-react';

// Import your existing components
import PrescriptionForm from './Prescription-form';
import PrescriberLink from './PrescriberLink';

const PrescriptionsPage = () => {
  // State to track which view is active. Default is 'form'.
  const [activeView, setActiveView] = useState('form');

  const renderContent = () => {
    switch (activeView) {
      case 'form':
        return <PrescriptionForm />;
      case 'link':
        return <PrescriberLink />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* 1. COMPACT LIGHT MENU SECTION */}
      <div className="border-b border-gray-100 bg-gray-50/50 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-12 md:gap-20">
          
          {/* Issue Prescription Button */}
          <button 
            onClick={() => setActiveView('form')}
            className={`flex items-center gap-3 group transition-all duration-300 ${activeView === 'form' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <Pencil 
              size={18} 
              className={`${activeView === 'form' ? 'text-gray-500' : 'text-gray-500'}`} 
            />
            <div className="flex flex-col items-start">
              <span className={`text-base font-bold transition-colors ${activeView === 'form' ? 'text-slate-600' : 'text-gray-500'}`}>
                Issue Prescription
              </span>
              <div className={`h-[2px] transition-all duration-300 bg-slate-600 ${activeView === 'form' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </div>
          </button>

          {/* Prescriber Link Button (Added) */}
          <button 
            onClick={() => setActiveView('link')}
            className={`flex items-center gap-3 group transition-all duration-300 ${activeView === 'link' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <LinkIcon 
              size={18} 
              className={`${activeView === 'link' ? 'text-gray-500' : 'text-gray-500'}`} 
            />
            <div className="flex flex-col items-start">
              <span className={`text-base font-bold transition-colors ${activeView === 'link' ? 'text-slate-600' : 'text-gray-500'}`}>
                Prescriber Link
              </span>
              <div className={`h-[2px] transition-all duration-300 bg-slate-600 ${activeView === 'link' ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </div>
          </button>
          
        </div>
      </div>

      {/* 2. RESULTS AREA */}
      <div className="max-w-7xl mx-auto p-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default PrescriptionsPage;