import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Package, Bell, CheckCircle } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const alertConfig = {
  expiry:    { icon: Clock,          color: 'bg-orange-50 border-orange-100 text-orange-600',  dot: 'bg-orange-400' },
  low_stock: { icon: Package,        color: 'bg-amber-50 border-amber-100 text-amber-600',     dot: 'bg-amber-400'  },
  default:   { icon: AlertTriangle,  color: 'bg-red-50 border-red-100 text-red-500',           dot: 'bg-red-400'    },
};

const PrescriberAlerts = () => {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/stock/alerts')
      .then(res => {
        const data = res.data?.alerts || res.data?.items || res.data || [];
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = {
    expiry:    alerts.filter(a => a.type === 'expiry'),
    low_stock: alerts.filter(a => a.type === 'low_stock'),
    other:     alerts.filter(a => a.type !== 'expiry' && a.type !== 'low_stock'),
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Alerts" alertCount={alerts.length} />
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Expiry Alerts',    value: grouped.expiry.length,    color: 'border-l-orange-400' },
            { label: 'Low Stock',        value: grouped.low_stock.length, color: 'border-l-amber-400'  },
            { label: 'Other',            value: grouped.other.length,     color: 'border-l-red-400'    },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 border-l-4 ${s.color}`}>
              <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">All clear!</p>
            <p className="text-xs text-slate-400">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => {
              const cfg  = alertConfig[alert.type] || alertConfig.default;
              const Icon = cfg.icon;
              return (
                <div key={idx}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${cfg.color}`}>
                  <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{alert.message}</p>
                    {alert.productName && (
                      <p className="text-xs mt-1 opacity-70 font-medium">{alert.productName}</p>
                    )}
                    {alert.expiryDate && (
                      <p className="text-xs mt-1 opacity-70">
                        Expires: {new Date(alert.expiryDate).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriberAlerts;