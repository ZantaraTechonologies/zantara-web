import React, { useState } from 'react';
import { 
    CreditCard, 
    Building2, 
    ChevronRight, 
    CheckCircle2, 
    ArrowLeft,
    ShieldCheck,
    Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as walletService from '../../services/wallet/walletService';

const UserFundWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'card' | 'transfer' | null>(null);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const { virtualAccount } = useWalletStore();

    const methods = [
        { 
            id: 'transfer', 
            name: 'Bank Transfer', 
            desc: 'Fund via your dedicated virtual account', 
            icon: Building2,
            badge: 'Instant'
        },
        { 
            id: 'card', 
            name: 'Debit Card', 
            desc: 'Pay securely with Paystack/Flutterwave', 
            icon: CreditCard,
            badge: 'Fast'
        }
    ];

    const handleContinue = () => {
        if (method === 'transfer') {
            navigate('/app/wallet/virtual-account');
        } else {
            setStep(3); // Show redirect info
        }
    };

    const handlePayment = async () => {
        try {
            setLoadingPayment(true);
            const val = Number(amount);
            const callback_url = `${window.location.origin}/paystack/return`;
            const data = await walletService.initPaystackServer(val, callback_url);
            
            if (data?.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                throw new Error('No authorization URL received');
            }
        } catch (error) {
            console.error('Payment init failed:', error);
            alert('Failed to initialize payment. Please try again.');
            setLoadingPayment(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-5 lg:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700 font-['Inter',_sans-serif]">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={18} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fund Wallet</h1>
                    <p className="text-slate-500 font-medium text-sm">Inject capital into your Zantara ecosystem.</p>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full bg-emerald-400 transition-all duration-500 ${step >= s ? 'w-full' : 'w-0'}`}></div>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Capital Amount (₦)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white border-2 border-slate-50 rounded-2xl p-6 text-3xl font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-200"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-xs">
                                NGN
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['500', '1000', '5000', '10000'].map((val) => (
                            <button 
                                key={val}
                                onClick={() => setAmount(val)}
                                className="bg-white border border-slate-50 py-4 rounded-xl font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-sm"
                            >
                                +₦{Number(val).toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={!amount || Number(amount) <= 0}
                        onClick={() => setStep(2)}
                        className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Continue to Method
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-4">
                        {methods.map((m) => (
                            <button 
                                key={m.id}
                                onClick={() => setMethod(m.id as any)}
                                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${method === m.id ? 'border-emerald-400 bg-emerald-50/50 shadow-xl shadow-emerald-500/10' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                            >
                                <div className="flex items-center gap-5 text-left">
                                    <div className={`p-4 rounded-xl transition-colors ${method === m.id ? 'bg-emerald-400 text-slate-950' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                                        <m.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md">{m.badge}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{m.desc}</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-[3px] transition-all flex items-center justify-center ${method === m.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-100 bg-white'}`}>
                                    {method === m.id && <CheckCircle2 size={14} className="text-slate-950" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => setStep(1)}
                            className="flex-1 bg-white border border-slate-100 text-slate-900 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all"
                        >
                            Back
                        </button>
                        <button 
                            disabled={!method}
                            onClick={handleContinue}
                            className="flex-[2] bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white border border-slate-50 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                        <Smartphone size={32} />
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Initiating Secure Gateway</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">
                            You're being redirected to our secure payment processor (Paystack) to complete your ₦{Number(amount).toLocaleString()} deposit.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <ShieldCheck size={14} />
                        <span>AES-256 Encrypted Transfer</span>
                    </div>

                    <div className="pt-4">
                        <button 
                            disabled={loadingPayment}
                            onClick={handlePayment}
                            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            {loadingPayment ? 'Redirecting...' : 'Continue to Payment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFundWalletPage;
