import React, { useState } from 'react';
import { 
    ArrowLeft, 
    Building2, 
    CheckCircle2, 
    ShieldCheck,
    Lock,
    Plus,
    Info,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useInvestmentSummary, useRequestDividendWithdrawal } from '../../hooks/useInvestment';
import { toast } from 'react-hot-toast';
import SecurePinModal from '../../components/modals/SecurePinModal';

const InvestmentWithdrawPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [withdrawalRes, setWithdrawalRes] = useState<any>(null);

    const { data: summary, isLoading: summaryLoading } = useInvestmentSummary();
    const { mutate: withdraw, isPending: submitting } = useRequestDividendWithdrawal();
    const { currency, linkedAccounts, fetchLinkedAccounts } = useWalletStore();

    React.useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    const handleWithdraw = (pin: string) => {
        const bank = linkedAccounts.find(a => a._id === selectedBank);
        if (!bank) return toast.error('Please select a bank');

        const payload = {
            amount: Number(amount),
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            accountName: bank.accountName,
            pin // We need the backend to verify the PIN
        };

        withdraw(payload as any, {
            onSuccess: (res) => {
                setWithdrawalRes(res.data.data);
                setStep(3);
                setIsPinModalOpen(false);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Withdrawal failed');
                setIsPinModalOpen(false);
            }
        });
    };

    if (summaryLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const balance = summary?.dividendBalance || 0;
    const feePercent = summary?.settings?.dividendWithdrawalFee || 0;
    const fee = Number(amount) * (feePercent / 100);
    const netAmount = Number(amount) - fee;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Withdraw Investment Earnings</h1>
                    <p className="text-slate-500 font-medium text-sm">Transfer your dividends to your local bank account.</p>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-8">
                    {/* Balance Preview */}
                    <div className="bg-emerald-950 rounded-[2rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 space-y-2 text-center">
                            <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px]">Available Dividends</p>
                            <h2 className="text-5xl font-black tracking-tighter">{currency} {balance.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Withdrawal Amount ({currency})</label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 text-3xl font-black text-slate-900 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-100"
                                    />
                                    {Number(amount) > 0 && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee ({feePercent}%)</p>
                                            <p className="text-sm font-black text-red-500">-{currency}{fee.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {Number(amount) > 0 && (
                                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100/50 flex justify-between items-center animate-in fade-in zoom-in duration-300">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">Estimated Payout</p>
                                        <p className="text-2xl font-black text-emerald-600">{currency}{netAmount.toLocaleString()}</p>
                                    </div>
                                    <ShieldCheck className="text-emerald-300" size={32} />
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic">
                                    Withdrawals from the investment wallet are subject to manual review and are typically processed within 24-48 business hours.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Destination Bank</h3>
                                <button onClick={() => navigate('/app/wallet/linked-accounts')} className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-emerald-600 transition-colors">
                                    <Plus size={14} />
                                    <span>Add Bank</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {linkedAccounts.length > 0 ? (
                                    linkedAccounts.map((acc) => (
                                        <button 
                                            key={acc._id}
                                            onClick={() => setSelectedBank(acc._id)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group group relative transition-all duration-300 ${selectedBank === acc._id ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02] shadow-lg shadow-emerald-500/5' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedBank === acc._id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-slate-900 text-sm">{acc.bankName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{acc.accountName} • {acc.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                                </div>
                                            </div>
                                            {selectedBank === acc._id && <CheckCircle2 className="text-emerald-500" size={20} />}
                                        </button>
                                    ))
                                ) : (
                                    <button 
                                        onClick={() => navigate('/app/wallet/linked-accounts')}
                                        className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all text-slate-400 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus size={32} />
                                        </div>
                                        <span className="font-black text-[10px] uppercase tracking-widest">Link a Bank Account</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={!amount || !selectedBank || Number(amount) <= 0 || Number(amount) > balance}
                        onClick={() => setIsPinModalOpen(true)}
                        className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 disabled:opacity-20 disabled:pointer-events-none active:scale-[0.98]"
                    >
                        {Number(amount) > balance ? 'Insufficient Dividend Balance' : 'Confirm Withdrawal Request'}
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-2xl text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto ring-8 ring-emerald-50/50">
                        <CheckCircle2 size={48} />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request Submitted</h2>
                        <p className="text-slate-500 font-medium text-sm">Your withdrawal of {currency}{Number(amount).toLocaleString()} is being reviewed. You'll be notified once approved.</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Status</span>
                            <span className="text-emerald-600">PENDING REVIEW</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                            <span>Reference</span>
                            <span className="text-slate-900">{withdrawalRes?.refId || 'N/A'}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/app/investments')}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        Back to Portfolio
                    </button>
                </div>
            )}

            <SecurePinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onConfirm={handleWithdraw}
                loading={submitting}
                title="Investment Authorization"
            />
        </div>
    );
};

export default InvestmentWithdrawPage;
