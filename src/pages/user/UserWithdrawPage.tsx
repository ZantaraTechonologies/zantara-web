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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Withdraw Funds</h1>
                    <p className="text-slate-500 font-medium text-sm">Liquidate your Zantara capital to local bank.</p>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-8">
                    {/* Balance Preview */}
                    <div className="bg-slate-950 rounded-2xl p-6 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">Settlement Balance</p>
                            <h2 className="text-3xl font-bold tracking-tighter">{currency} {balance?.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-2">Withdrawal Amount (₦)</label>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 text-3xl font-bold text-slate-900 focus:border-red-400 outline-none transition-all placeholder:text-slate-100"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Destination Hub</h3>
                            <button onClick={() => navigate('/app/wallet/linked-accounts')} className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} />
                                <span>Add New Bank</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {linkedAccounts.length > 0 ? (
                                linkedAccounts.map((acc, i) => (
                                    <button 
                                        key={acc._id}
                                        onClick={() => setSelectedBank(acc._id)}
                                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${selectedBank === acc._id ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedBank === acc._id ? 'bg-emerald-400 text-slate-950' : 'bg-slate-50 text-slate-400'}`}>
                                                <Building2 size={24} />
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
                                    className="w-full py-10 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-50 transition-all text-slate-400"
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
                        className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {Number(amount) > balance ? 'Insufficient Capital' : 'Initiate Settlement'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-md mx-auto bg-white border border-slate-50 rounded-2xl p-8 sm:p-10 space-y-8 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 mx-auto">
                        <Lock size={28} />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Secure Authorization</h2>
                        <p className="text-slate-500 font-medium text-sm">Enter your 4-digit security PIN to authorize the ₦{Number(amount).toLocaleString()} withdrawal.</p>
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
                                className="w-14 h-16 bg-slate-50 border-2 border-slate-50 rounded-xl text-center text-2xl font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <div className="pt-6 space-y-4">
                        <button 
                            disabled={pin.some(p => !p) || submitting}
                            onClick={handleWithdraw}
                            className="w-full bg-emerald-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/10 disabled:opacity-30"
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
                <div className="max-w-md mx-auto bg-white border border-slate-50 rounded-2xl p-8 sm:p-10 space-y-8 shadow-sm text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Withdrawal Sent</h2>
                        <p className="text-slate-500 font-medium text-sm">Your request for ₦{Number(amount).toLocaleString()} is being processed. Funds should hit your account within 2-24 hours.</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Status</span>
                            <span className="text-emerald-600">{withdrawalRes?.status?.toUpperCase() || 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Reference</span>
                            <span className="text-slate-900">{withdrawalRes?.refId || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => navigate('/app/wallet')}
                            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
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
