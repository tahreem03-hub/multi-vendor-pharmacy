import PrescriberHeader from "../components/prescriber/PrescriberHeader";
import { useMyThreePot } from "../hooks/usePrescriberData";
import { MdNotificationsNone, MdErrorOutline, MdInfoOutline } from 'react-icons/md';

const PrescriberAlerts = () => {
    // Fetches live data from the ThreePort document for the logged-in prescriber
    const { data, loading } = useMyThreePot();
    
    // Accesses the alerts array from the ThreePort model
    const alerts = data?.alerts || [];
    const unreadcount = alerts.filter(a => !a.isRead).length;

    return (
        <div className="min-h-screen bg-slate-100">
            <PrescriberHeader title="Financial Notifications" />
            
            <div className="p-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {/* Fixed icon syntax and size */}
                        <MdNotificationsNone className="text-slate-400" size={24} />
                        <h2 className="text-xl font-bold text-slate-700">Recent Alerts</h2>
                        {unreadcount > 0 && (
                            <span className="bg-slate-500 text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                {unreadcount} new
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <p className="text-slate-400 font-medium">
                            Your financial status is healthy. No new alerts.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div 
                                key={alert._id}
                                className={`bg-white p-5 rounded-2xl border transition-all ${
                                    alert.isRead ? 'opacity-60 border-slate-100' : 'border-teal-100 shadow-sm'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Alert icon logic based on alert type from model */}
                                    <div className={`mt-1 p-2 rounded-lg ${
                                        alert.type === 'warning' || alert.type === 'deposit_breach' 
                                        ? 'bg-orange-50 text-orange-500' 
                                        : 'bg-blue-50 text-blue-500'
                                    }`}>
                                        {alert.type === 'warning' || alert.type === 'deposit_breach' 
                                            ? <MdErrorOutline size={20} /> 
                                            : <MdInfoOutline size={20} />
                                        }
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-bold ${alert.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                                                {/* Displays dynamic alert messages from the database */}
                                                {alert.type?.replace('_', ' ').toUpperCase() || 'NOTIFICATION'}
                                            </h4>
                                            <span className="text-[10px] text-slate-300 font-bold">
                                                {new Date(alert.createdAt).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriberAlerts;