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
import { Link, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';

const UserFundWalletPage: React.FC = () => {
    const [loadingPayment, setLoadingPayment] = useState(false);

    const handleContinue = () => {
        if (method === 'transfer') {
            navigate('/app/wallet/virtual-account');
        } else {
            setStep(3); // Show redirect countdown/info
        }
    };

    const handlePayment = async () => {
        try {
            setLoadingPayment(true);
            const val = Number(amount);
            // In a real app, callback_url should be the success page on your domain
            const callback_url = `${window.location.origin}/app/wallet`;
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
        <div className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            {/* ... (existing header) */}

            {/* ... (existing step indicators) */}

            {/* Step 1 & 2 (unchanged) */}
            {/* ... */}

            {step === 3 && (
                <div className="bg-white border border-slate-50 rounded-[3rem] p-10 sm:p-14 space-y-12 shadow-sm text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                        <Smartphone size={40} />
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Initiating Secure Gateway</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                            You're being redirected to our secure payment processor (Paystack) to complete your ₦{Number(amount).toLocaleString()} deposit.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck size={16} />
                        <span>AES-256 Encrypted Transfer</span>
                    </div>

                    <div className="pt-6">
                        <button 
                            disabled={loadingPayment}
                            onClick={handlePayment}
                            className="w-full bg-slate-950 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
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
