import React from 'react';

import PrescriberLink from './PrescriberLink';

const PrescriptionsPage = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50/50 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-base font-bold text-slate-700">
            Prescriber Collaboration
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Link with a prescriber and request prescriptions for your patients
          </p>
        </div>
      </div>

      {/* Content — Link a Prescriber + Request a Prescription */}
      <div className="max-w-7xl mx-auto p-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
        <PrescriberLink />
      </div>
    </div>
  );
};

export default PrescriptionsPage;