import React, { useState } from 'react';
import { useReferralData, useRedeemEarnings } from '../../hooks/useReferral';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { Wallet, ArrowRight, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SecurePinModal from '../../components/modals/SecurePinModal';

const RedeemEarningsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stats } = useReferralData();
    const { mutate: redeem, isPending } = useRedeemEarnings();
    const { currency } = useWalletStore();
    const [amount, setAmount] = useState<string>('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRedeemClick = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(amount);
        if (amt < 100) return;
        setIsPinModalOpen(true);
    };

    const handlePinSubmit = (pin: string) => {
        redeem({ amount: Number(amount), pin }, {
            onSuccess: () => {
                setSuccess(true);
                setIsPinModalOpen(false);
            }
        });
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-12 text-center space-y-8 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Redemption Successful</h2>
                    <p className="text-slate-500 text-sm">{currency}{Number(amount).toLocaleString()} has been moved to your main wallet.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link 
                        to="/app/dashboard"
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                    >
                        Go to Dashboard
                    </Link>
                    <Link 
                        to="/app/referral/wallet"
                        className="w-full bg-white text-slate-500 py-4 rounded-2xl font-bold text-sm hover:text-slate-900 transition-all"
                    >
                        Back to Referral Wallet
                    </Link>
                </div>
            </div>
        );
    }

    const currentBalance = stats?.referralBalance || 0;
    const isAmountValid = Number(amount) >= 100 && Number(amount) <= currentBalance;

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/app/referral/wallet" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowRight size={20} className="rotate-180" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Redeem Earnings</h1>
                    <p className="text-slate-500 text-xs font-medium">Transfer funds to your main wallet balance.</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Redemption Amount</span>
                        <span>Available: {currency}{currentBalance.toLocaleString()}</span>
                     </div>
                     
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 font-bold text-xl group-focus-within:text-emerald-500 transition-colors uppercase">{currency}</div>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Min 100"
                            className="w-full bg-slate-50 border-0 text-2xl font-bold text-slate-900 py-6 px-12 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                        />
                     </div>

                     <div className="flex gap-2">
                         {[100, 500, 1000, 5000].map(val => (
                             <button 
                                key={val}
                                onClick={() => setAmount(val.toString())}
                                className="flex-1 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all"
                             >
                                {currency}{val}
                             </button>
                         ))}
                     </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100/50 space-y-4">
                     <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 transition-transform hover:scale-105">
                            <Wallet className="text-emerald-500" size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Target Wallet</p>
                            <p className="text-emerald-600 text-sm font-bold">Main Wallet (Settlement Account)</p>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-emerald-100/30 flex items-center gap-3 text-emerald-700/60">
                         <ShieldCheck size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Instant Network Transfer Protocol Enabled</span>
                     </div>
                </div>

                <button 
                    onClick={handleRedeemClick}
                    disabled={!isAmountValid || isPending}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isAmountValid && !isPending
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {isPending ? 'Processing...' : 'Transfer to Main Wallet'}
                    <ArrowRight size={18} />
                </button>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                        Transfers from the referral wallet to your main wallet are processed instantly. Ensure your Transaction PIN is active and secure before proceeding.
                    </p>
                </div>
            </div>

            <SecurePinModal 
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handlePinSubmit}
                loading={isPending}
                title="Redemption Verification"
            />
        </div>
    );
};

export default RedeemEarningsPage;
