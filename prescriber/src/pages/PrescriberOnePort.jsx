import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Wallet, Package, AlertCircle, Bell, BellOff,
  Receipt, Shield, Activity, BarChart3, PoundSterling,
  ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2,
  Info,
} from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const ledgerIcon = (type) => {
  const pos = ['PATIENT_PAYMENT_RECEIVED', 'VAT_INPUT_RECORDED', 'VAT_REFUND_RECEIVED', 'COMMISSION_EARNED', 'INITIAL_FLOAT', 'VAT_PAYABLE_RELEASED'];
  return pos.includes(type)
    ? <ArrowUpRight size={13} className="text-emerald-500 shrink-0" />
    : <ArrowDownRight size={13} className="text-red-400 shrink-0" />;
};

const BalanceTile = ({ label, value, icon: Icon, accent = 'slate', sub, info }) => {
  const c = {
    emerald: { bg: 'bg-emerald-50', ico: 'text-emerald-600', val: 'text-emerald-600' },
    amber:   { bg: 'bg-amber-50',   ico: 'text-amber-600',   val: 'text-amber-600'   },
    red:     { bg: 'bg-red-50',     ico: 'text-red-500',     val: 'text-red-500'     },
    violet:  { bg: 'bg-violet-50',  ico: 'text-violet-600',  val: 'text-violet-600'  },
    blue:    { bg: 'bg-blue-50',    ico: 'text-blue-600',    val: 'text-blue-600'    },
    slate:   { bg: 'bg-slate-50',   ico: 'text-slate-600',   val: 'text-slate-800'   },
  }[accent] || { bg: 'bg-slate-50', ico: 'text-slate-600', val: 'text-slate-800' };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={16} className={c.ico} />
        </div>
        {info && <span title={info}><Info size={11} className="text-slate-300 cursor-help" /></span>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${c.val}`}>{fmt(value)}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

const TABS = ['overview', 'ledger', 'vat', 'commission'];

const PrescriberOnePort = () => {
  const [port,       setPort]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [markingId,  setMarkingId]  = useState(null);

  const fetchPort = useCallback(async () => {
    try {
      const res = await API.get('/port/my');
      setPort(res.data);
    } catch (err) {
      console.error('Failed to load port:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPort(); }, [fetchPort]);

  const handleMarkRead = async (alertId) => {
    setMarkingId(alertId);
    try {
      await API.patch(`/port/my/mark-alert/${alertId}`);
      setPort(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => a._id === alertId ? { ...a, isRead: true } : a),
      }));
      toast.success('Alert dismissed');
    } catch {
      toast.error('Failed to dismiss alert');
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading your OnePort...</p>
      </div>
    </div>
  );

  if (!port) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <AlertCircle size={32} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">No OnePort record found</p>
        <p className="text-xs text-slate-400 mt-1">Contact support if this persists</p>
      </div>
    </div>
  );

  const unreadAlerts = port.alerts?.filter(a => !a.isRead) || [];
  const statusMap = {
    green: { label: 'Operational',  dot: 'bg-emerald-400', banner: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    amber: { label: 'Caution',      dot: 'bg-amber-400',   banner: 'bg-amber-50 border-amber-200 text-amber-700'       },
    red:   { label: 'Action Req.',  dot: 'bg-red-400',     banner: 'bg-red-50 border-red-200 text-red-700'             },
  };
  const status = statusMap[port.equilibriumStatus] || statusMap.green;

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="OnePort Financial Hub" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-5">

        {/* Unread alerts banner */}
        {unreadAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Bell size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              You have {unreadAlerts.length} unread alert{unreadAlerts.length > 1 ? 's' : ''}.{' '}
              <button onClick={() => setActiveTab('overview')} className="underline font-bold">View alerts</button>
            </p>
          </div>
        )}

        {/* Status + summary bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Equilibrium Status</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{status.label}</p>
            </div>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available to Spend</p>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{fmt(port.availableToSpend)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">True Pot Value</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{fmt(port.truePotValue)}</p>
            </div>
          </div>
        </div>

        {/* 8 balance tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BalanceTile label="Cash Balance"       value={port.cashBalance}       icon={Wallet}       accent="slate"   info="Actual cash held in the pot" />
          <BalanceTile label="Available to Spend" value={port.availableToSpend}  icon={PoundSterling} accent="emerald" info="Cash − restricted VAT − pending commitments" />
          <BalanceTile label="Stock Value"        value={port.stockValue}        icon={Package}      accent="violet"  info="Value of your allocated medicines" />
          <BalanceTile label="True Pot Value"     value={port.truePotValue}      icon={BarChart3}    accent="slate"   info="Cash + Stock + Pending VAT Refund − Restricted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BalanceTile label="Pending VAT Refund"  value={port.pendingVatRefund}     icon={Receipt}    accent="emerald" info="HMRC owes this — submitted but not yet received" />
          <BalanceTile label="Restricted (VAT)"    value={port.restrictedVatPayable} icon={Shield}     accent="amber"   info="Ring-fenced — owed to HMRC, cannot be spent" />
          <BalanceTile label="Working Float"       value={port.workingFloat}         icon={Activity}   accent="amber"   info="Buffer for cash-flow timing gaps" />
          <BalanceTile label="Earned Profit"       value={port.earnedProfit}         icon={TrendingUp} accent="emerald" info="Your cumulative commission earnings" />
        </div>

        {/* Tabs panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}{tab === 'overview' && unreadAlerts.length > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadAlerts.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* Overview / Alerts */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VAT snapshot */}
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">VAT This Period</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Input VAT',    value: port.currentVatPeriod?.inputVat,      c: 'text-emerald-600' },
                        { label: 'Output VAT',   value: port.currentVatPeriod?.outputVat,     c: 'text-amber-600'   },
                        { label: 'Net Position', value: port.currentVatPeriod?.netVatPosition, c: (port.currentVatPeriod?.netVatPosition || 0) >= 0 ? 'text-emerald-600' : 'text-red-500' },
                        { label: 'Period',       value: null, text: port.currentVatPeriod?.status || 'open' },
                      ].map((r, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">{r.label}</p>
                          {r.value !== null && r.value !== undefined
                            ? <p className={`text-sm font-bold mt-0.5 ${r.c}`}>{fmt(r.value)}</p>
                            : <p className="text-sm font-bold mt-0.5 text-slate-700 capitalize">{r.text}</p>
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Alerts {unreadAlerts.length > 0 && <span className="text-amber-500">({unreadAlerts.length} unread)</span>}
                    </p>
                    {port.alerts?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {port.alerts.map((alert) => (
                          <div key={alert._id} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${alert.isRead ? 'bg-slate-50' : 'bg-amber-50 border border-amber-200'}`}>
                            <div className={`mt-0.5 shrink-0 ${alert.isRead ? 'text-slate-300' : 'text-amber-500'}`}>
                              {alert.isRead ? <BellOff size={13} /> : <Bell size={13} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${alert.isRead ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>{alert.message}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(alert.createdAt)}</p>
                            </div>
                            {!alert.isRead && (
                              <button
                                onClick={() => handleMarkRead(alert._id)}
                                disabled={markingId === alert._id}
                                className="shrink-0 text-[10px] font-bold text-amber-600 hover:text-amber-800 underline"
                              >
                                {markingId === alert._id ? '...' : 'Dismiss'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <CheckCircle2 size={22} className="text-emerald-300 mb-1" />
                        <p className="text-xs text-slate-400">All clear — no alerts</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ledger */}
            {activeTab === 'ledger' && (
              <div>
                <p className="text-xs text-slate-400 mb-3">{port.ledger?.length || 0} entries — most recent first</p>
                {port.ledger?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Date', 'Type', 'Description', 'Cash Δ', 'VAT Pos Δ', 'Profit Δ'].map(h => (
                            <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-4 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[...port.ledger].reverse().slice(0, 50).map((entry, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 pr-4 text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(entry.createdAt)}</td>
                            <td className="py-2.5 pr-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {ledgerIcon(entry.type)}
                                <span className="text-[10px] font-mono font-semibold text-slate-600">{entry.type.replace(/_/g, ' ')}</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-xs text-slate-500 max-w-[180px] truncate">{entry.description || '—'}</td>
                            <td className={`py-2.5 pr-4 text-xs font-semibold whitespace-nowrap ${entry.cashDelta > 0 ? 'text-emerald-600' : entry.cashDelta < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                              {entry.cashDelta !== 0 ? fmt(entry.cashDelta) : '—'}
                            </td>
                            <td className={`py-2.5 pr-4 text-xs font-semibold whitespace-nowrap ${entry.vatPositionDelta > 0 ? 'text-emerald-600' : entry.vatPositionDelta < 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                              {entry.vatPositionDelta !== 0 ? fmt(entry.vatPositionDelta) : '—'}
                            </td>
                            <td className={`py-2.5 text-xs font-semibold whitespace-nowrap ${entry.profitDelta > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {entry.profitDelta > 0 ? fmt(entry.profitDelta) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-8">No ledger entries yet</p>
                )}
              </div>
            )}

            {/* VAT */}
            {activeTab === 'vat' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Input VAT',      value: port.currentVatPeriod?.inputVat,       accent: 'emerald', desc: 'Paid on purchases — reclaimable' },
                    { label: 'Output VAT',     value: port.currentVatPeriod?.outputVat,      accent: 'amber',   desc: 'Charged to patients — owed to HMRC' },
                    { label: 'Net Position',   value: port.currentVatPeriod?.netVatPosition, accent: (port.currentVatPeriod?.netVatPosition || 0) >= 0 ? 'emerald' : 'red', desc: 'Positive = HMRC refund expected' },
                    { label: 'Pending Refund', value: port.pendingVatRefund,                 accent: 'emerald', desc: 'Submitted but not yet received' },
                  ].map((t, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">{t.label}</p>
                      <p className={`text-xl font-black mt-1 ${t.accent === 'emerald' ? 'text-emerald-600' : t.accent === 'red' ? 'text-red-500' : 'text-amber-600'}`}>
                        {fmt(t.value)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="border border-slate-100 rounded-xl p-4 flex flex-wrap gap-6">
                  {[
                    { label: 'Period Start',    value: fmtDate(port.currentVatPeriod?.startDate) },
                    { label: 'Period End',      value: fmtDate(port.currentVatPeriod?.endDate)   },
                    { label: 'Period Status',   value: port.currentVatPeriod?.status || 'open'   },
                    { label: 'Ring-fenced',     value: fmt(port.restrictedVatPayable)            },
                  ].map((r, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-slate-400">{r.label}</p>
                      <p className="text-sm font-semibold text-slate-700 capitalize">{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">How VAT works in your pot</p>
                  <p className="text-xs text-blue-600">
                    For standard medicines, you collect 20% output VAT from patients (owed to HMRC) but also reclaim 20% input VAT on purchases.
                    For POM (prescription) medicines, there is <strong>no output VAT</strong> charged — but you still reclaim input VAT on the purchase cost, creating a net positive VAT position for HMRC to refund.
                  </p>
                </div>
              </div>
            )}

            {/* Commission */}
            {activeTab === 'commission' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Payout History</p>
                  <p className="text-xs text-slate-400">Total earned: <strong className="text-emerald-600">{fmt(port.earnedProfit)}</strong></p>
                </div>
                {port.commissionPayouts?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Period', 'Invoice #', 'Amount (ex VAT)', 'Paid At', 'Status'].map(h => (
                            <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-6 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[...port.commissionPayouts].reverse().map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-3 pr-6 text-sm font-medium text-slate-700">{p.month}</td>
                            <td className="py-3 pr-6 text-xs font-mono text-slate-400">{p.invoiceNumber || '—'}</td>
                            <td className="py-3 pr-6 text-sm font-semibold text-slate-800">{fmt(p.amountExVat)}</td>
                            <td className="py-3 pr-6 text-xs text-slate-400">{fmtDate(p.paidAt)}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : p.status === 'invoice_raised' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                {p.status?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-8">No commission payouts yet</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriberOnePort;