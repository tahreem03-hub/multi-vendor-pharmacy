import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Link } from 'lucide-react';

// The "Issue Prescription" tab/route (/prescription-form) has been removed
// from this customer-facing nav. That form sent free-text prescriber
// details with no real prescriberId, so it couldn't route to an actual
// prescriber account — requests fell back to Admin instead of the
// linked prescriber.
//
// "PrescribeLink™" (Link a Prescriber + Request a Prescription) already
// uses a real prescriberId sourced from the customer's active linked
// prescribers, matching the doc's Section 3 flow — left unchanged here.
//
// A separate "Issue Prescription" flow, restricted to verified
// prescribers only and auto-populated from their own account (per
// doc Section 4), will be added to the prescriber's own dashboard as
// a next step — not on this customer-facing nav.
const PrescriptionDetailed = () => {
  const tabs = [
    { name: 'PrescribeLink™', path: '/prescriberLink', icon: Link },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) => `
                relative flex items-center py-5 px-1 text-sm font-bold transition-all duration-200 whitespace-nowrap group
                ${isActive ? 'text-slate-600' : 'text-slate-500 hover:text-slate-600'}
              `}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    className={`w-4 h-4 mr-2 transition-colors ${
                      isActive ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-500'
                    }`}
                  />
                  <span>{tab.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-600 rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default PrescriptionDetailed;