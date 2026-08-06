import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Building2, 
    ChevronRight, 
    CheckCircle2, 
    ShieldCheck, 
    Lock,
    Plus,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';

const UserWithdrawPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [pin, setPin] = useState(['', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const [withdrawalRes, setWithdrawalRes] = useState<any>(null);
    const { balance, currency, fetchBalance, fetchLinkedAccounts, linkedAccounts, loading } = useWalletStore();

    useEffect(() => {
        fetchBalance();
        fetchLinkedAccounts();
    }, []);

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 3) {
            const next = document.getElementById(`pin-${index + 1}`);
            next?.focus();
        }
    };

    const handleWithdraw = async () => {
        try {
            setSubmitting(true);
            const bank = linkedAccounts.find(a => a._id === selectedBank);
            if (!bank) throw new Error('Bank not found');

            const payload = {
                amount: Number(amount),
                bankName: bank.bankName,
                accountNumber: bank.accountNumber,
                accountName: bank.accountName,
                pin: pin.join('')
            };

            const data = await walletService.requestWithdrawal(payload);
            setWithdrawalRes(data.request);
            setStep(3); // Success state
        } catch (error: any) {
            console.error('Withdrawal failed:', error);
            alert(error.response?.data?.message || error.message || 'Withdrawal failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Withdraw Funds</h1>
                    <p className="text-slate-500 font-medium text-sm">Liquidate your Zantara capital to local bank.</p>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-5">
                    {/* Balance Preview */}
                    <div className="bg-surface border border-slate-100 rounded-2xl p-5 text-slate-900 relative overflow-hidden shadow-card group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald-100/60 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-emerald-200/60 transition-all duration-700"></div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-brand-emerald font-bold uppercase tracking-[0.2em] text-[10px]">Settlement Balance</p>
                            <h2 className="text-3xl font-bold tracking-tighter">{currency} {balance?.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-2">Withdrawal Amount ({currency})</label>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-surface border-2 border-slate-50 rounded-2xl p-5 text-3xl font-bold text-slate-900 focus:border-red-400 outline-none transition-all placeholder:text-slate-100"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Destination Hub</h3>
                            <button onClick={() => navigate('/app/wallet/linked-accounts')} className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} />
                                <span>Add New Bank</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {linkedAccounts.length > 0 ? (
                                linkedAccounts.map((acc, i) => (
                                    <button 
                                        key={acc._id}
                                        onClick={() => setSelectedBank(acc._id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${selectedBank === acc._id ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-50 bg-surface hover:border-slate-100'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${selectedBank === acc._id ? 'bg-brand-emerald text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                <Building2 size={22} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-slate-900 text-sm">{acc.bankName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">{acc.accountName} • {acc.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                            </div>
                                        </div>
                                        {selectedBank === acc._id && <CheckCircle2 className="text-emerald-500" size={20} />}
                                    </button>
                                ))
                            ) : (
                                <button 
                                    onClick={() => navigate('/app/wallet/linked-accounts')}
                                    className="w-full py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-50 transition-all text-slate-400"
                                >
                                    <Plus size={32} strokeWidth={1.5} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Link Withdrawal Bank</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <button 
                        disabled={!amount || !selectedBank || Number(amount) <= 0 || Number(amount) > balance}
                        onClick={() => setStep(2)}
                        className="w-full bg-brand-emerald text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {Number(amount) > balance ? 'Insufficient Capital' : 'Initiate Settlement'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-md mx-auto bg-surface border border-slate-50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
                    <div className="w-14 h-14 bg-brand-emerald/10 rounded-xl flex items-center justify-center text-brand-emerald mx-auto">
                        <Lock size={24} />
                    </div>
                    
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Secure Authorization</h2>
                        <p className="text-slate-500 font-medium text-sm">Enter your 4-digit security PIN to authorize the {currency}{Number(amount).toLocaleString()} withdrawal.</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        {pin.map((p, i) => (
                            <input 
                                key={i}
                                id={`pin-${i}`}
                                type="password"
                                maxLength={1}
                                value={p}
                                onChange={(e) => handlePinChange(i, e.target.value)}
                                className="w-14 h-14 bg-slate-50 border-2 border-slate-50 rounded-xl text-center text-2xl font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <div className="pt-4 space-y-4">
                        <button 
                            disabled={pin.some(p => !p) || submitting}
                            onClick={handleWithdraw}
                            className="w-full bg-brand-emerald text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-30"
                        >
                            {submitting ? 'Authorizing...' : 'Authorize & Send'}
                        </button>
                        <button 
                            onClick={() => setStep(1)}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Cancel Transaction
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-md mx-auto bg-surface border border-slate-50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                        <CheckCircle2 size={32} />
                    </div>
                    
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Withdrawal Sent</h2>
                        <p className="text-slate-500 font-medium text-sm">Your request for {currency}{Number(amount).toLocaleString()} is being processed. Funds should hit your account within 2-24 hours.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Status</span>
                            <span className="text-emerald-600">{withdrawalRes?.status?.toUpperCase() || 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Reference</span>
                            <span className="text-slate-900">{withdrawalRes?.refId || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={() => navigate('/app/wallet')}
                            className="w-full bg-brand-emerald text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn"
                        >
                            Return to Wallet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserWithdrawPage;
