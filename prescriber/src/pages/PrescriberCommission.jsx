import PrescriberHeader from "../components/prescriber/PrescriberHeader";
import { useMyThreePot } from "../hooks/usePrescriberData";
import { MdAccountBalanceWallet, MdHistory } from 'react-icons/md';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors = {
    pending: 'text-orange-500 bg-orange-50',
    invoice_raised: 'text-blue-600 bg-blue-50',
    paid: 'text-green-600 bg-green-50'
};

const PrescriberCommission = () => {
    const { data, loading } = useMyThreePot();

    const commission = data?.pot3?.commissionSubAccount || 0;
    const totalRevenue = data?.pot3?.totalRevenueExVat || 0;
    const payouts = data?.commissionPayouts || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <PrescriberHeader title="Commission & Earnings" />
            
            <div className="p-4 sm:p-8">
                {/* Stats Cards Grid: Now 1 col on mobile, 2 on tablet, 3 on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    
                    {/* Available Commission Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-500 text-white rounded-lg">
                                <MdAccountBalanceWallet size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600">Available Commission</h3>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{fmt(commission)}</p>
                        <p className="text-sm text-slate-400 mt-2">Ready for next payout cycle</p>
                    </div>

                    {/* Total Revenue Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-500 text-white rounded-lg">
                                <MdHistory size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600">Total Revenue (Ex VAT)</h3>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{fmt(totalRevenue)}</p>
                        <p className="text-sm text-slate-400 mt-2">Gross sales performance</p>
                    </div>
                </div>

                {/* Payout History Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-700">Commission Payout History</h3>
                        <span className="text-sm text-gray-400 font-medium">{payouts.length} Payments</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : payouts.length === 0 ? (
                        <p className="text-center text-gray-400 py-16 font-medium">No payout records found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Month", "Invoice #", "Amount (Ex VAT)", "Status", "Paid At"].map((h) => (
                                            <th key={h} className="text-left text-xs font-semibold text-slate-400 px-5 py-4 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                            <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">{p.month}</td>
                                            <td className="px-5 py-4 text-slate-500 font-mono">{p.invoiceNumber || '---'}</td>
                                            <td className="px-5 py-4 font-bold text-slate-800">{fmt(p.amountExVat)}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${statusColors[p.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {p.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-GB') : 'Pending'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriberCommission;