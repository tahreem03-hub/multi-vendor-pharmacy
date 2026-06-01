import { useState, useEffect } from 'react';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const equilibriumConfig = {
  green: { label: '✓ equilibrium', cls: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  amber: { label: '⚠ near limit',  cls: 'text-amber-600 bg-amber-50 border-amber-100' },
  red:   { label: '✗ breach',      cls: 'text-rose-600 bg-rose-50 border-rose-100' },
};

const Threepot = () => {
  const [pots, setPots]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [depositForm, setDeposit] = useState({ amount: '', paidBy: '' });
  const [saving, setSaving]       = useState(false);
  const [syncing, setSyncing]     = useState(false);

  const fetchPots = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/port/admin/all');
      const potsData = data.pots || [];
      setPots(potsData);
      if (potsData.length > 0 && !selected) setSelected(potsData[0]);
    } catch (err) {
      toast.error('failed to load three-pot data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPots(); }, []);

  const totalPot1 = pots.reduce((s, p) => s + (p.pot1?.stockValueExVat || 0), 0);
  const totalPot2 = pots.reduce((s, p) => s + (p.pot2?.depositAmount   || 0), 0);
  const totalPot3 = pots.reduce((s, p) => s + (p.pot3?.totalRevenueExVat    || 0), 0);

  const handleSetDeposit = async () => {
    if (!depositForm.amount || !selected) return;
    setSaving(true);
    try {
      await API.patch(`/port/admin/${selected.prescriberId}/set-deposit`, {
        depositAmount: Number(depositForm.amount),
        depositPaidBy: depositForm.paidBy,
      });
      toast.success('deposit updated');
      setDeposit({ amount: '', paidBy: '' });
      fetchPots();
    } catch (err) {
      toast.error('failed to update deposit');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!selected) return;
    setSyncing(true);
    try {
      await API.patch(`/port/admin/${selected.prescriberId}/sync`);
      toast.success('pot 1 synced');
      fetchPots();
    } catch (err) {
      toast.error('sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <Header title="Three-Pot System" />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-black">Financial Dashboard</h1>
            <p className="text-slate-500 text-sm">real-time overview of the three-pot model</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] tracking-wider font-bold text-slate-400">total system liquidity</p>
              <p className="text-lg font-bold text-black">{fmt(totalPot1 + totalPot2 + totalPot3)}</p>
            </div>
          </div>
        </div>

        {/* global summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'total stock (pot 1)', value: totalPot1, color: 'text-black' },
            { label: 'total deposits (pot 2)', value: totalPot2, color: 'text-black' },
            { label: 'total revenue (pot 3)', value: totalPot3, color: 'text-black' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <p className="text-md font-bold text-slate-600 tracking-wide">{item.label}</p>
              <p className={`text-xl font-bold mt-1 ${item.color}`}>{fmt(item.value)}</p>
            </div>
          ))}
        </div>

        {/* prescriber selector */}
        <div className="mb-8">
          <p className="text-md font-bold text-black mb-3 tracking-tight">select prescriber</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {pots.map((pot) => (
              <button
                key={pot.prescriberId}
                onClick={() => setSelected(pot)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${selected?.prescriberId === pot.prescriberId
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-black'}`}
              >
                {pot.prescriber?.firstName} {pot.prescriber?.lastName}
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="space-y-6">
            {/* main pot view */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* pot 1 card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <button onClick={handleSync} disabled={syncing} className="text-black hover:text-slate-600 transition">
                    <span className={`block ${syncing ? 'animate-spin' : ''}`}>↻</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <span className="text-md font-bold text-black">pot 1: stock</span>
                </div>
                <h3 className="text-3xl font-bold text-black">{fmt(selected.pot1?.stockValueExVat)}</h3>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-md font-medium">sync status:</span>
                  <span className="text-black font-bold">updated {selected.pot1?.lastSyncedAt ? new Date(selected.pot1.lastSyncedAt).toLocaleDateString() : 'never'}</span>
                </div>
              </div>

              {/* pot 2 card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-md font-bold text-black">pot 2: deposit</span>
                </div>
                <h3 className="text-2xl font-bold text-black">{fmt(selected.pot2?.depositAmount)}</h3>
                <div className="mt-4">
                   <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${equilibriumConfig[selected.equilibriumStatus]?.cls}`}>
                    {selected.equilibriumStatus?.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* pot 3 card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  <span className="text-xs font-bold text-black">pot 3: revenue</span>
                </div>
                <h3 className="text-3xl font-bold text-black">{fmt(selected.pot3?.totalRevenueExVat)}</h3>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs font-bold">
                  <span className="text-slate-400">commission:</span>
                  <span className="text-black">{fmt(selected.pot3?.commissionSubAccount)}</span>
                </div>
              </div>

            </div>

            {/* action sections */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* deposit form */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-black mb-6">adjust pot 2 deposit</h4>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="amount (£)"
                    value={depositForm.amount}
                    onChange={e => setDeposit(d => ({ ...d, amount: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="reference / note"
                    value={depositForm.paidBy}
                    onChange={e => setDeposit(d => ({ ...d, paidBy: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                  <button
                    onClick={handleSetDeposit}
                    disabled={saving || !depositForm.amount}
                    className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'processing...' : 'update balance'}
                  </button>
                </div>
              </div>

              {/* mini table */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                <h4 className="text-sm font-bold text-black mb-6">payout records</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-semibold tracking-wider">month</th>
                        <th className="pb-3 font-semibold tracking-wider text-right">amount</th>
                        <th className="pb-3 font-semibold tracking-wider text-right">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selected.commissionPayouts?.map((p, i) => (
                        <tr key={i} className="group hover:bg-slate-50">
                          <td className="py-4 text-slate-600 font-medium">{p.month}</td>
                          <td className="py-4 text-right font-bold text-black">{fmt(p.amountExVat)}</td>
                          <td className="py-4 text-right">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 font-bold text-[9px]">
                              {p.status?.replace('_', ' ').toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      )) || (
                        <tr><td colSpan="3" className="py-8 text-center text-slate-400">no records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Threepot;