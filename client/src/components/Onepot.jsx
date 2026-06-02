import { useState, useEffect } from 'react';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Onepot = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [depositForm, setDeposit] = useState({ amount: '', paidBy: '' });
  const [saving, setSaving] = useState(false);

  const fetchPorts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/port/admin/all');
      const portsData = data.ports || [];
      setPorts(portsData);
      if (portsData.length > 0 && !selected) setSelected(portsData[0]);
    } catch (err) {
      toast.error('failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPorts(); }, []);

  const totalLiquidity = ports.reduce((s, p) => s + (p.cashBalance || 0), 0);
  const totalEarned = ports.reduce((s, p) => s + (p.earnedProfit || 0), 0);

  const handleSetDeposit = async () => {
    if (!depositForm.amount || !selected) return;
    setSaving(true);
    try {
      await API.patch(`/port/admin/${selected.prescriberId}/add-cash`, {
        amount: Number(depositForm.amount),
        note: depositForm.paidBy,
      });
      toast.success('cash balance updated');
      setDeposit({ amount: '', paidBy: '' });
      fetchPorts();
    } catch (err) {
      toast.error('failed to update cash');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <Header title="One-Pot System" />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-black">Financial Portfolio</h1>
            <p className="text-slate-500 text-sm">unified one-pot management</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] tracking-wider font-bold text-slate-400">total system liquidity</p>
            <p className="text-lg font-bold text-black">{fmt(totalLiquidity)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-md font-bold text-slate-600 tracking-wide">total cash balance</p>
            <p className="text-xl font-bold mt-1 text-black">{fmt(totalLiquidity)}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-md font-bold text-slate-600 tracking-wide">accumulated profit</p>
            <p className="text-xl font-bold mt-1 text-emerald-600">{fmt(totalEarned)}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-md font-bold text-black mb-3 tracking-tight">select portfolio</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ports.map((port) => (
              <button
                key={port.prescriberId}
                onClick={() => setSelected(port)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${selected?.prescriberId === port.prescriberId
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-black'}`}
              >
                {port.prescriberName}
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-md font-bold text-black block mb-4">cash balance</span>
                <h3 className="text-4xl font-black text-black">{fmt(selected.cashBalance)}</h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-md font-bold text-black block mb-4">earned profit</span>
                <h3 className="text-4xl font-black text-emerald-600">{fmt(selected.earnedProfit)}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-black mb-6">inject liquidity</h4>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="amount (£)"
                  value={depositForm.amount}
                  onChange={e => setDeposit(d => ({ ...d, amount: e.target.value }))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={handleSetDeposit}
                  disabled={saving || !depositForm.amount}
                  className="px-8 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'processing...' : 'add funds'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onepot;