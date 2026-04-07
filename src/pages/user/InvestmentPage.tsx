import React, { useState } from 'react';
import { 
    useInvestmentSummary, 
    useInvestmentHistory, 
    useBuyShares, 
    useReinvestDividends, 
    useRedeemToMainWallet,
    useRequestShareExit
} from '../../hooks/useInvestment';
import { 
    TrendingUp, 
    Wallet, 
    ArrowRight, 
    Receipt, 
    Info, 
    ShieldCheck, 
    AlertCircle, 
    Briefcase,
    Plus,
    History,
    LogOut,
    RefreshCw,
    Coins
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import SecurePinModal from '../../components/modals/SecurePinModal';
import { toast } from 'react-hot-toast';

const InvestmentPage: React.FC = () => {
    const { data: summary, isLoading: summaryLoading } = useInvestmentSummary();
    const { data: historyRes, isLoading: historyLoading } = useInvestmentHistory(1, 10);
    const { currency } = useWalletStore();
    
    const { mutate: buyShares, isPending: buyPending } = useBuyShares();
    const { mutate: reinvest, isPending: reinvestPending } = useReinvestDividends();
    const { mutate: redeem, isPending: redeemPending } = useRedeemToMainWallet();
    const { mutate: requestExit, isPending: exitPending } = useRequestShareExit();

    const [buyQty, setBuyQty] = useState('');
    const [reinvestQty, setReinvestQty] = useState('');
    const [redeemAmount, setRedeemAmount] = useState('');
    const [exitQty, setExitQty] = useState('');

    const [activeModal, setActiveModal] = useState<'buy' | 'reinvest' | 'redeem' | 'exit' | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const isLoading = summaryLoading || historyLoading;
    const historyItems = historyRes?.data || [];

    const handleActionClick = (action: 'buy' | 'reinvest' | 'redeem' | 'exit') => {
        setActiveModal(action);
        setIsPinModalOpen(true);
    };

    const handlePinConfirm = (pin: string) => {
        if (activeModal === 'buy') {
            buyShares(Number(buyQty), {
                onSuccess: () => {
                    toast.success('Shares purchased successfully');
                    setBuyQty('');
                    setIsPinModalOpen(false);
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Purchase failed')
            });
        } else if (activeModal === 'reinvest') {
            reinvest(Number(reinvestQty), {
                onSuccess: () => {
                    toast.success('Dividends reinvested successfully');
                    setReinvestQty('');
                    setIsPinModalOpen(false);
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Reinvestment failed')
            });
        } else if (activeModal === 'redeem') {
            redeem(Number(redeemAmount), {
                onSuccess: () => {
                    toast.success('Funds moved to main wallet');
                    setRedeemAmount('');
                    setIsPinModalOpen(false);
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Redemption failed')
            });
        } else if (activeModal === 'exit') {
            requestExit(Number(exitQty), {
                onSuccess: () => {
                    toast.success('Exit request submitted');
                    setExitQty('');
                    setIsPinModalOpen(false);
                },
                onError: (err: any) => toast.error(err.response?.data?.message || 'Exit request failed')
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const settings = summary?.settings;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Shareholder Portfolio</h1>
                <p className="text-slate-500 font-medium">Invest in Zantara technologies and earn monthly dividends.</p>
            </div>

            {/* Main Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio Summary Card */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Total Value</span>
                                <h2 className="text-6xl font-black tracking-tighter">
                                    {currency}{(summary.sharesOwned * (settings?.sharePrice || 0)).toLocaleString()}
                                </h2>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                <span className="text-xs font-bold text-emerald-400">{summary.sharesOwned} Shares owned</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 py-8 border-y border-white/5">
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Lifetime Earnings</p>
                                <p className="text-2xl font-black text-emerald-400">{currency}{summary.totalDividendsEarned.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Investment Wallet</p>
                                <p className="text-2xl font-black">{currency}{summary.dividendBalance.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link 
                                to="/app/investments/withdraw"
                                className="flex-1 bg-emerald-500 text-slate-950 px-8 py-5 rounded-2xl font-black text-sm text-center hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Withdraw Earnings
                            </Link>
                            <button 
                                onClick={() => {
                                    setRedeemAmount(summary.dividendBalance > 0 ? summary.dividendBalance.toString() : '');
                                    handleActionClick('redeem');
                                }}
                                className="flex-1 bg-white/10 backdrop-blur-md text-white px-8 py-5 rounded-2xl font-black text-sm text-center hover:bg-white/20 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Move to Main Wallet
                            </button>
                        </div>
                    </div>
                </div>

                {/* Next Payout Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                            <TrendingUp size={24} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Company Profit Allocation</p>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tight">{settings?.investorAllocationPercent || 20}%</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Next Payout Day</span>
                                <span className="text-blue-600">Day {settings?.dividendPayoutDay || 1}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-1/3 rounded-full"></div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">Dividends are calculated from monthly net profit.</p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-400">
                            <ShieldCheck size={16} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Audited & Verified Distribution</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Investment Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buy Shares Form */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight">Purchase Additional Shares</h3>
                            <p className="text-xs text-slate-400 font-medium">Accumulate more ownership in Zantara profit.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                            <span>Current Share Price</span>
                            <span className="text-emerald-500">{currency}{settings?.sharePrice?.toLocaleString()}</span>
                        </div>
                        <input 
                            type="number" 
                            placeholder="Enter quantity of shares"
                            value={buyQty}
                            onChange={(e) => setBuyQty(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-5 text-lg font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button 
                            disabled={!buyQty || buyPending}
                            onClick={() => handleActionClick('buy')}
                            className="w-full bg-emerald-500 text-slate-950 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {buyPending ? 'Processing...' : 'Purchase Shares Now'}
                            <ArrowRight size={18} />
                        </button>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                            <Plus size={12} />
                            <span>Max {settings?.maxSharesPerUser} shares per user. {settings?.sharesRemaining} remaining in pool.</span>
                        </div>
                    </div>
                </div>

                {/* Exit / Reinvest Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Reinvest Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Auto-Reinvest</h3>
                                <p className="text-xs text-slate-400 font-medium">Use dividends to buy more shares + compound earnings.</p>
                            </div>
                        </div>
                        <button 
                            disabled={summary.dividendBalance < (settings?.sharePrice || 0)}
                            onClick={() => {
                                setReinvestQty('1');
                                handleActionClick('reinvest');
                            }}
                            className="bg-slate-50 hover:bg-blue-500 hover:text-white text-slate-900 p-4 rounded-2xl transition-all active:scale-90"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    {/* Exit Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-amber-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:-rotate-12 transition-transform">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Principal Exit</h3>
                                <p className="text-xs text-slate-400 font-medium">Liquidate your investment and return principal.</p>
                            </div>
                        </div>
                        <button 
                            disabled={!summary.canExit || summary.sharesOwned === 0}
                            onClick={() => {
                                setExitQty(summary.availableShares.toString());
                                handleActionClick('exit');
                            }}
                            className={`p-4 rounded-2xl transition-all active:scale-90 ${summary.canExit ? 'bg-slate-50 hover:bg-amber-500 hover:text-white text-slate-900' : 'bg-slate-50 text-slate-200 cursor-not-allowed'}`}
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    {/* Lock Status Info */}
                    {!summary.canExit && summary.sharesOwned > 0 && (
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
                            <AlertCircle size={20} className="text-amber-500 shrink-0" />
                            <p className="text-[11px] font-bold text-amber-800 tracking-tight">
                                Your principal investment is locked until <span className="font-black underline">{summary.lockExpiresAt ? format(new Date(summary.lockExpiresAt), 'MMM dd, yyyy') : 'N/A'}</span> (6 Month Lock Policy).
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History size={24} className="text-slate-400" />
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">Earnings History</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Transaction ID</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Type</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Date</th>
                                <th className="pb-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {historyItems.length > 0 ? (
                                historyItems.map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 font-bold text-slate-400 text-xs tracking-wider">{item.transactionId}</td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    item.type === 'dividend_credit' ? 'bg-emerald-500' :
                                                    item.type === 'share_purchase' ? 'bg-blue-500' :
                                                    'bg-amber-500'
                                                }`}></div>
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                                    {item.type?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-xs font-medium text-slate-500">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</td>
                                        <td className="py-6 text-right font-black text-sm text-slate-900">
                                            {item.type === 'dividend_credit' ? '+' : '-'} {currency}{item.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <Receipt size={40} />
                                            <p className="text-xs font-bold uppercase tracking-widest">No investment history available yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SecurePinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onConfirm={handlePinConfirm}
                loading={buyPending || reinvestPending || redeemPending || exitPending}
            />
        </div>
    );
};

export default InvestmentPage;
