import { useState } from 'react';
import { BiCheck } from 'react-icons/bi';
import {
  MdDashboard, MdInventory, MdPeople, MdAssignment,
  MdBarChart, MdSettings, MdLogout, MdMenu, MdClose,
  MdAccountBalanceWallet, MdNotifications, MdReceipt,
  MdPermMedia, MdEditAttributes 
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { key: 'dashboard',       label: 'Dashboard',      icon: MdDashboard },
  { key: 'threepot',        label: 'Three-Pot',      icon: MdAccountBalanceWallet },
  { key: 'orders',          label: 'My Orders',      icon: MdReceipt },
  { key: 'stock',           label: 'My Stock',       icon: MdInventory },
  { key: 'patients',        label: 'Patients',       icon: MdPeople },
  { key: 'prescriptions',   label: 'Prescriptions',  icon: MdAssignment },
  { key: 'commission',      label: 'Commission',     icon: MdBarChart },
  { key: 'alerts',          label: 'Alerts',         icon: MdNotifications },
{ key: 'contact-setting', label: 'Contact setting', icon: MdPermMedia },   // Linked here
  { key: 'settings',        label: 'Settings',       icon: MdSettings },
];

const PrescriberSidebar = ({ activePage, setActivePage }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside className={`
      flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm
      transition-all duration-300 ease-in-out shrink-0
      ${collapsed ? 'w-16' : 'w-64'}
    `}>

      {/* Logo + Toggle Section */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100">
              <BiCheck className="text-white text-xl" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">
              DrG<span className="text-teal-600">Pharma</span>
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-teal-600 transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <MdMenu size={22} /> : <MdClose size={22} />}
        </button>
      </div>

      {/* Profile Card */}
      {!collapsed && (
        <div className="mx-4 mt-1 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600 mb-1">
            Prescriber Portal
          </p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">{user?.prescriberId}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => {
                console.log("CLICKED:", key);
                setActivePage(key);
              }}
              title={collapsed ? label : ''}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-100 translate-x-1'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="px-3 pb-6 mt-auto">
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : ''}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            text-sm font-semibold text-red-500 hover:bg-red-50 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <MdLogout size={20} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default PrescriberSidebar;