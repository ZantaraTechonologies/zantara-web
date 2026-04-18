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
import InvestmentTransferModal from '../../components/modals/InvestmentTransferModal';
import { paymentService } from '../../services/payment/paymentService';
import { toast } from 'react-hot-toast';
import { CreditCard, Building2 } from 'lucide-react';

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
    const [redeemSource, setRedeemSource] = useState<'dividend' | 'referral'>('dividend');
    const [exitQty, setExitQty] = useState('');

    const [activeModal, setActiveModal] = useState<'buy' | 'reinvest' | 'redeem' | 'exit' | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    
    // New payment states
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'transfer'>('wallet');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferDetails, setTransferDetails] = useState<any>(null);
    const [initializingPayment, setInitializingPayment] = useState(false);

    const isLoading = summaryLoading || historyLoading;
    const historyItems = historyRes?.data || [];

    const handleActionClick = async (action: 'buy' | 'reinvest' | 'redeem' | 'exit') => {
        if (action === 'buy' && paymentMethod !== 'wallet') {
            const qty = Number(buyQty);
            const sharePrice = summary?.settings?.sharePrice || 0;
            const totalCost = qty * sharePrice;

            if (qty <= 0) {
                toast.error('Please enter a valid quantity');
                return;
            }

            try {
                setInitializingPayment(true);
                const isTransfer = paymentMethod === 'transfer';
                const res = await paymentService.initializePayment(
                    totalCost, 
                    'investment_buy', 
                    { qty }, 
                    isTransfer
                );

                if (isTransfer) {
                    setTransferDetails({
                        ...res,
                        amount: totalCost,
                        currency: currency
                    });
                    setIsTransferModalOpen(true);
                } else if (res.authorization_url) {
                    window.location.href = res.authorization_url;
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to initialize payment');
            } finally {
                setInitializingPayment(false);
            }
            return;
        }

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
            redeem({ amount: Number(redeemAmount), source: redeemSource }, {
                onSuccess: () => {
                    toast.success(`${redeemSource === 'dividend' ? 'Dividends' : 'Referral earnings'} moved to main wallet`);
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8 border-y border-white/5">
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Lifetime Dividends</p>
                                <p className="text-2xl font-black text-emerald-400">{currency}{summary.totalDividendsEarned.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Dividend Balance</p>
                                <p className="text-2xl font-black">{currency}{summary.dividendBalance.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Referral Balance</p>
                                <p className="text-2xl font-black text-amber-400">{currency}{summary.referralBalance.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                                <div className="flex flex-wrap items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                                    <button 
                                        onClick={() => { setRedeemSource('dividend'); setRedeemAmount(''); }}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${redeemSource === 'dividend' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Dividends
                                    </button>
                                    <button 
                                        onClick={() => { setRedeemSource('referral'); setRedeemAmount(''); }}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${redeemSource === 'referral' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Referrals
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                        Amount to {redeemSource === 'referral' ? 'Referral' : 'Dividend'} Wallet
                                    </span>
                                    {((redeemSource === 'dividend' ? summary.dividendBalance : summary.referralBalance) > 0) && (
                                        <button 
                                            onClick={() => setRedeemAmount((redeemSource === 'dividend' ? summary.dividendBalance : summary.referralBalance).toString())}
                                            className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                                        >
                                            [ Use Max ]
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <input 
                                        type="number" 
                                        placeholder={`Enter amount from ${redeemSource}s`}
                                        value={redeemAmount}
                                        onChange={(e) => setRedeemAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                                    />
                                    {Number(redeemAmount) > 0 && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40">
                                            Fee: {settings?.dividendRedeemFee}%
                                        </div>
                                    )}
                                </div>
                                <button 
                                    disabled={!redeemAmount || Number(redeemAmount) <= 0 || Number(redeemAmount) > (redeemSource === 'dividend' ? summary.dividendBalance : summary.referralBalance) || redeemPending}
                                    onClick={() => handleActionClick('redeem')}
                                    className={`px-8 py-4 rounded-2xl font-black text-sm transition-all disabled:opacity-20 flex items-center justify-center gap-2 whitespace-nowrap ${redeemSource === 'referral' ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-white text-slate-900 hover:bg-emerald-400'}`}
                                >
                                    <RefreshCw size={18} className={redeemPending ? 'animate-spin' : ''} />
                                    Move {redeemSource === 'referral' ? 'Referral' : 'Earnings'} 
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link 
                                to="/app/investments/withdraw"
                                className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-8 py-5 rounded-2xl font-black text-sm text-center hover:bg-emerald-500 hover:text-slate-950 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Withdraw to Bank Account
                            </Link>
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

                        {/* Payment Method Selector */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Payment Method</p>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'wallet' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-100'}`}
                                >
                                    <Wallet size={20} />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">Wallet</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('card')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-100'}`}
                                >
                                    <CreditCard size={20} />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">Card</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'transfer' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-100'}`}
                                >
                                    <Building2 size={20} />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">Transfer</span>
                                </button>
                            </div>
                        </div>

                        <button 
                            disabled={!buyQty || Number(buyQty) < (settings?.minSharesPerPurchase || 1) || buyPending || initializingPayment}
                            onClick={() => handleActionClick('buy')}
                            className="w-full bg-emerald-500 text-slate-950 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {initializingPayment ? 'Initializing...' : buyPending ? 'Processing...' : (Number(buyQty) > 0 && Number(buyQty) < (settings?.minSharesPerPurchase || 1)) ? `Min ${settings?.minSharesPerPurchase} Shares Required` : 'Purchase Shares Now'}
                            <ArrowRight size={18} />
                        </button>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
                            <div className="flex items-center gap-2">
                                <Plus size={12} />
                                <span>Max {settings?.maxSharesPerUser} shares per user.</span>
                            </div>
                            <span className="font-bold text-emerald-500">Min: {settings?.minSharesPerPurchase || 1} Shares</span>
                        </div>
                    </div>
                </div>

                {/* Exit / Reinvest Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Reinvest Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Compound Dividends</h3>
                                <p className="text-xs text-slate-400 font-medium">Reinvest earnings into more shares.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <input 
                                        type="number" 
                                        placeholder="Qty"
                                        value={reinvestQty}
                                        onChange={(e) => setReinvestQty(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl p-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Shares</div>
                                </div>
                                <button 
                                    disabled={!reinvestQty || Number(reinvestQty) < 1 || reinvestPending || (Number(reinvestQty) * (settings?.sharePrice || 0)) > summary.dividendBalance}
                                    onClick={() => handleActionClick('reinvest')}
                                    className="bg-blue-500 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                            {Number(reinvestQty) > 0 && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                    Cost: {currency}{(Number(reinvestQty) * (settings?.sharePrice || 0)).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Exit Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 group hover:border-amber-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:-rotate-12 transition-transform">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Principal Exit</h3>
                                <p className="text-xs text-slate-400 font-medium">Liquidate shares and return principal.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <input 
                                        type="number" 
                                        placeholder="Qty"
                                        value={exitQty}
                                        onChange={(e) => setExitQty(e.target.value)}
                                        disabled={!summary.canExit}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl p-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 disabled:opacity-50"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Shares</div>
                                </div>
                                <button 
                                    disabled={!summary.canExit || !exitQty || Number(exitQty) < 1 || Number(exitQty) > summary.availableShares || exitPending}
                                    onClick={() => handleActionClick('exit')}
                                    className="bg-amber-500 text-white p-4 rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                            {summary.canExit && summary.availableShares > 0 && (
                                <button 
                                    onClick={() => setExitQty(summary.availableShares.toString())}
                                    className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1 hover:text-amber-700 transition-colors"
                                >
                                    [ Max: {summary.availableShares} Shares ]
                                </button>
                            )}
                        </div>
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

            <InvestmentTransferModal 
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                details={transferDetails}
            />
        </div>
    );
};

export default InvestmentPage;
