import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  TrendingUp, Wallet, Package, RefreshCw, ChevronRight,
  Bell, BellOff, PoundSterling, Receipt, Shield, Activity,
  BarChart3, ArrowUpRight, ArrowDownRight, Info, CheckCircle2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const StatusPill = ({ status }) => {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${map[status] || map.green}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'green' ? 'bg-emerald-500' : status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
};

const ledgerTypeIcon = (type) => {
  const pos = ['PATIENT_PAYMENT_RECEIVED', 'VAT_INPUT_RECORDED', 'VAT_REFUND_RECEIVED', 'COMMISSION_EARNED', 'INITIAL_FLOAT', 'VAT_PAYABLE_RELEASED'];
  return pos.includes(type)
    ? <ArrowUpRight size={13} className="text-emerald-500 shrink-0" />
    : <ArrowDownRight size={13} className="text-red-400 shrink-0" />;
};

const BalanceTile = ({ label, value, icon: Icon, accent = 'black', info }) => {
  const colours = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-600' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   val: 'text-amber-600'   },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     val: 'text-red-500'     },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  val: 'text-violet-600'  },
    black:   { bg: 'bg-slate-50',   icon: 'text-slate-600',   val: 'text-black'       },
  };
  const c = colours[accent] || colours.black;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon size={15} className={c.icon} />
        </div>
        {info && <span title={info}><Info size={12} className="text-slate-300 cursor-help" /></span>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className={`text-xl font-black ${c.val}`}>{fmt(value)}</p>
      </div>
    </div>
  );
};

const TABS = ['overview', 'ledger', 'vat', 'alerts', 'inject funds'];

// ─── Main Component ───────────────────────────────────────────
const Onepot = () => {
  const [ports,       setPorts]       = useState([]);
  const [detail,      setDetail]      = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [detailLoad,  setDetailLoad]  = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [depositForm, setDeposit]     = useState({ amount: '', paidBy: '' });

  const fetchPorts = useCallback(async (keepSelected = false) => {
    setLoading(true);
    try {
      const { data } = await API.get('/port/admin/all');
      const list = data.ports || [];
      setPorts(list);
      if (!keepSelected && list.length > 0) setSelected(list[0]);
    } catch {
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (prescriberId) => {
    if (!prescriberId) return;
    setDetailLoad(true);
    try {
      const { data } = await API.get(`/port/admin/${prescriberId}`);
      setDetail(data.port || data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoad(false);
    }
  }, []);

  useEffect(() => { fetchPorts(); }, [fetchPorts]);
  useEffect(() => { if (selected?.prescriberId) fetchDetail(selected.prescriberId); }, [selected, fetchDetail]);

  const totalCash   = ports.reduce((s, p) => s + (p.cashBalance || 0), 0);
  const totalSpend  = ports.reduce((s, p) => s + (p.availableToSpend || 0), 0);
  const totalStock  = ports.reduce((s, p) => s + (p.stockValue || 0), 0);
  const totalProfit = ports.reduce((s, p) => s + (p.earnedProfit || 0), 0);

  const handleSync = async () => {
    if (!selected) return;
    setSyncing(true);
    try {
      await API.patch(`/port/admin/${selected.prescriberId}/sync`);
      toast.success('Pot synced');
      await fetchPorts(true);
      await fetchDetail(selected.prescriberId);
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSetDeposit = async () => {
    if (!depositForm.amount || !selected) return;
    setSaving(true);
    try {
      await API.patch(`/port/admin/${selected.prescriberId}/set-deposit`, {
        depositAmount: Number(depositForm.amount),
        depositPaidBy: depositForm.paidBy,
      });
      toast.success('Cash balance updated');
      setDeposit({ amount: '', paidBy: '' });
      await fetchPorts(true);
      await fetchDetail(selected.prescriberId);
    } catch {
      toast.error('Failed to update cash');
    } finally {
      setSaving(false);
    }
  };

  const prescriberName = (port) => {
    if (!port) return '—';
    const p = port.prescriber;
    if (p && typeof p === 'object' && p.firstName) return `${p.firstName} ${p.lastName || ''}`.trim();
    return port.prescriberId || '—';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header title="One-Pot System" />

      <div className="p-5 max-w-[1400px] mx-auto space-y-5">

        {/* System totals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <BalanceTile label="Total Cash" value={totalCash} icon={Wallet} accent="black" info="Sum of all cash balances across all pots" />
          <BalanceTile label="Available to Spend" value={totalSpend} icon={PoundSterling} accent="emerald" info="Cash minus restricted VAT and pending commitments" />
          <BalanceTile label="Total Stock Value" value={totalStock} icon={Package} accent="violet" />
          <BalanceTile label="Total Earned Profit" value={totalProfit} icon={TrendingUp} accent="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">

          {/* Prescriber list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prescribers</p>
            </div>
            <div className="divide-y divide-slate-50 max-h-[calc(100vh-300px)] overflow-y-auto">
              {ports.map((port) => {
                const isActive = selected?.prescriberId === port.prescriberId;
                const unread   = port.alerts?.filter(a => !a.isRead)?.length || 0;
                return (
                  <button
                    key={port.prescriberId}
                    onClick={() => { setSelected(port); setActiveTab('overview'); }}
                    className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>{prescriberName(port)}</p>
                      <p className={`text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{port.prescriberId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${isActive ? 'bg-white text-black' : 'bg-red-500 text-white'}`}>
                          {unread}
                        </span>
                      )}
                      <ChevronRight size={13} className="text-slate-300" />
                    </div>
                  </button>
                );
              })}
              {ports.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No prescribers found</p>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="space-y-4">

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-bold text-slate-900">{prescriberName(detail || selected)}</h2>
                    <StatusPill status={(detail || selected).equilibriumStatus || 'green'} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selected.prescriberId} · {(detail || selected).currency || 'GBP'}</p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-black hover:text-black transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing...' : 'Sync Pot'}
                </button>
              </div>

              {/* 8 balance tiles */}
              {detailLoad ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : detail && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BalanceTile label="Cash Balance"       value={detail.cashBalance}       icon={Wallet}       accent="black"   info="Actual cash held in the pot" />
                    <BalanceTile label="Available to Spend" value={detail.availableToSpend}  icon={PoundSterling} accent="emerald" info="Cash − restricted VAT − pending commitments" />
                    <BalanceTile label="Stock Value"        value={detail.stockValue}        icon={Package}      accent="violet"  info="Value of medicines allocated to this prescriber" />
                    <BalanceTile label="True Pot Value"     value={detail.truePotValue}      icon={BarChart3}    accent="black"   info="Cash + Stock + Pending VAT Refund − Restricted VAT" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BalanceTile label="Pending VAT Refund"   value={detail.pendingVatRefund}      icon={Receipt}   accent="emerald" info="HMRC owes this — not yet received" />
                    <BalanceTile label="Restricted (VAT)"     value={detail.restrictedVatPayable}  icon={Shield}    accent="amber"   info="Ring-fenced — must be paid to HMRC" />
                    <BalanceTile label="Working Float"        value={detail.workingFloat}          icon={Activity}  accent="amber"   info="Buffer for cash-flow timing gaps" />
                    <BalanceTile label="Earned Profit"        value={detail.earnedProfit}          icon={TrendingUp} accent="emerald" info="Cumulative commission earned" />
                  </div>
                </>
              )}

              {/* Tabs */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 overflow-x-auto">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* Overview */}
                  {activeTab === 'overview' && detail && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-100 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Current VAT Period</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Input VAT',   value: detail.currentVatPeriod?.inputVat,      accent: 'emerald' },
                              { label: 'Output VAT',  value: detail.currentVatPeriod?.outputVat,     accent: 'red'     },
                              { label: 'Net Position',value: detail.currentVatPeriod?.netVatPosition, accent: detail.currentVatPeriod?.netVatPosition >= 0 ? 'emerald' : 'red' },
                              { label: 'Status',      value: null, status: detail.currentVatPeriod?.status || 'open' },
                            ].map((row, i) => (
                              <div key={i} className="bg-slate-50 rounded-lg p-3">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400">{row.label}</p>
                                {row.value !== null && row.value !== undefined
                                  ? <p className={`text-sm font-bold mt-0.5 ${row.accent === 'emerald' ? 'text-emerald-600' : row.accent === 'red' ? 'text-red-500' : 'text-slate-800'}`}>{fmt(row.value)}</p>
                                  : <p className="text-sm font-bold mt-0.5 text-slate-700 capitalize">{row.status}</p>
                                }
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Commission Payouts</p>
                          {detail.commissionPayouts?.length > 0 ? (
                            <div className="space-y-2 max-h-36 overflow-y-auto">
                              {[...detail.commissionPayouts].reverse().slice(0, 5).map((cp, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">{cp.month}</p>
                                    <p className="text-[10px] text-slate-400">{cp.invoiceNumber || 'No invoice'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-slate-800">{fmt(cp.amountExVat)}</p>
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${cp.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : cp.status === 'invoice_raised' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                      {cp.status?.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-4">No payouts yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ledger */}
                  {activeTab === 'ledger' && detail && (
                    <div>
                      <p className="text-xs text-slate-400 mb-3">{detail.ledger?.length || 0} entries — most recent first</p>
                      {detail.ledger?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-slate-100">
                                {['Date', 'Type', 'Description', 'Cash Δ', 'Stock Δ', 'VAT Δ', 'Profit Δ'].map(h => (
                                  <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-4 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {[...detail.ledger].reverse().slice(0, 50).map((entry, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-2.5 pr-4 text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(entry.createdAt)}</td>
                                  <td className="py-2.5 pr-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      {ledgerTypeIcon(entry.type)}
                                      <span className="text-[10px] font-mono font-semibold text-slate-600">{entry.type.replace(/_/g, ' ')}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 pr-4 text-xs text-slate-500 max-w-[200px] truncate">{entry.description || '—'}</td>
                                  <td className={`py-2.5 pr-4 text-xs font-semibold whitespace-nowrap ${entry.cashDelta > 0 ? 'text-emerald-600' : entry.cashDelta < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                                    {entry.cashDelta !== 0 ? fmt(entry.cashDelta) : '—'}
                                  </td>
                                  <td className={`py-2.5 pr-4 text-xs font-semibold whitespace-nowrap ${entry.stockDelta > 0 ? 'text-emerald-600' : entry.stockDelta < 0 ? 'text-violet-500' : 'text-slate-300'}`}>
                                    {entry.stockDelta !== 0 ? fmt(entry.stockDelta) : '—'}
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
                  {activeTab === 'vat' && detail && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Input VAT (Reclaimable)',  value: detail.currentVatPeriod?.inputVat,      accent: 'emerald', info: 'VAT paid on purchases — HMRC owes this back' },
                          { label: 'Output VAT (Payable)',     value: detail.currentVatPeriod?.outputVat,     accent: 'amber',   info: 'VAT collected from patients — owed to HMRC' },
                          { label: 'Net VAT Position',         value: detail.currentVatPeriod?.netVatPosition, accent: (detail.currentVatPeriod?.netVatPosition || 0) >= 0 ? 'emerald' : 'red', info: 'Input − Output. Positive = refund expected' },
                          { label: 'Pending Refund',           value: detail.pendingVatRefund,                accent: 'emerald', info: 'Submitted but not yet received from HMRC' },
                        ].map((t, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-4">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{t.label}</p>
                            <p className={`text-xl font-black ${t.accent === 'emerald' ? 'text-emerald-600' : t.accent === 'red' ? 'text-red-500' : 'text-amber-600'}`}>{fmt(t.value)}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{t.info}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border border-slate-100 rounded-xl p-4 flex flex-wrap gap-6">
                        {[
                          { label: 'Period Start',    value: fmtDate(detail.currentVatPeriod?.startDate) },
                          { label: 'Period End',      value: fmtDate(detail.currentVatPeriod?.endDate)   },
                          { label: 'Period Status',   value: detail.currentVatPeriod?.status || 'open'   },
                          { label: 'Restricted Cash', value: fmt(detail.restrictedVatPayable)            },
                        ].map((r, i) => (
                          <div key={i}>
                            <p className="text-[10px] text-slate-400">{r.label}</p>
                            <p className="text-sm font-semibold text-slate-700 capitalize">{r.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerts */}
                  {activeTab === 'alerts' && detail && (
                    <div className="space-y-2">
                      {detail.alerts?.length > 0 ? (
                        detail.alerts.map((alert, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${alert.isRead ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
                            <div className={`mt-0.5 ${alert.isRead ? 'text-slate-300' : 'text-amber-500'}`}>
                              {alert.isRead ? <BellOff size={15} /> : <Bell size={15} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${alert.isRead ? 'text-slate-400' : 'text-slate-700'}`}>{alert.message}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(alert.createdAt)} · {alert.type}</p>
                            </div>
                            {!alert.isRead && (
                              <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Unread</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <CheckCircle2 size={28} className="text-emerald-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No alerts</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inject Funds */}
                  {activeTab === 'inject funds' && (
                    <div className="max-w-md space-y-3">
                      <p className="text-sm text-slate-500">
                        Set the cash balance for <strong>{prescriberName(detail || selected)}</strong>'s pot. This records a manual liquidity injection.
                      </p>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Amount (£)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">£</span>
                          <input
                            type="number" min="0" step="0.01" placeholder="0.00"
                            value={depositForm.amount}
                            onChange={e => setDeposit(d => ({ ...d, amount: e.target.value }))}
                            className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-black transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Reference / Paid By</label>
                        <input
                          type="text" placeholder="Bank transfer ref, cheque #, etc."
                          value={depositForm.paidBy}
                          onChange={e => setDeposit(d => ({ ...d, paidBy: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleSetDeposit}
                        disabled={saving || !depositForm.amount}
                        className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors"
                      >
                        {saving ? 'Processing...' : 'Inject Funds'}
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center bg-white border border-slate-200 rounded-2xl h-64 shadow-sm">
              <p className="text-sm text-slate-400">Select a prescriber to view their pot</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onepot;