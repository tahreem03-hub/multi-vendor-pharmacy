import { useState } from 'react';
import PrescriberSidebar from '../components/prescriber/PrescriberSidebar';

// ── Real page imports ─────────────────────────────────────────
import PrescriberDashboard from './PrescriberDashboard';
import PrescriberCommission from './PrescriberCommission';
import MediaManager from '../components/MediaManager';
import FooterSetting from './FooterSettings';
import PrescriberOrders from './Prescriberorders';
import PrescriberStock from './Prescriberstock';
import PrescriberPatient from './Prescriberpatients';
import PrescriberPrescriptions from './PrescriberPrescriptions';
import PrescriberAlerts from './PrescriberAlerts';
import PrescriberSettings from './PrescriberSettings';
import Prescriberthreepot from './Prescriberthreepot';
import PrescriberPosts from '../components/PrescriberPosts';
import ContactSetting from './ContactSetting';


// ── Updated placeholder to fit the strict white & slate-600 setup ───────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-white">
    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚧</div>
    <h2 className="text-xl font-medium text-slate-800">{title}</h2>
    <p className="text-sm text-slate-600">This section is under construction</p>
  </div>
);

// ── Page renderer — keys must match sidebar navItems keys exactly ──
const renderPage = (activePage) => {
  switch (activePage) {
    case 'dashboard':       return <PrescriberDashboard />;
    case 'media-manager':   return <MediaManager />;
    case 'threepot':        return <Prescriberthreepot/>;
    case 'orders':          return <PrescriberOrders />;
    case 'stock':           return <PrescriberStock/>;
    case 'patients':        return <PrescriberPatient />;
    case 'prescriptions':   return <PrescriberPrescriptions/>;
    case 'commission':      return <PrescriberCommission/>;
    case 'alerts':          return <PrescriberAlerts/>;
    case 'settings':        return <PrescriberSettings />;
    case 'footer-settings': return <FooterSetting />;
    case 'posts':           return <PrescriberPosts />;
case 'contact-setting': return <ContactSetting/>;
    default:                return <PrescriberDashboard />;
  }
};

const PrescriberLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  console.log("Current activePage state is:", activePage);

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-600">
      <PrescriberSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto bg-white">
        {renderPage(activePage)}
      </main>
    </div>
  );
};

export default PrescriberLayout;