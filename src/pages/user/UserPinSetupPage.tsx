import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { toast } from 'react-toastify';
import { ShieldCheck, ArrowLeft, Lock, Save, AlertCircle } from 'lucide-react';
import { SubmitButton } from '../../components/buy/Buy';

const UserPinSetupPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(1); // 1: Enter, 2: Confirm
    const [loading, setLoading] = useState(false);

    const pinRefs = useRef<HTMLInputElement[]>([]);
    const confirmRefs = useRef<HTMLInputElement[]>([]);

    const handleChange = (idx: number, val: string, isConfirm: boolean) => {
        const currentPin = isConfirm ? confirmPin : pin;
        const setter = isConfirm ? setConfirmPin : setPin;
        const refs = isConfirm ? confirmRefs : pinRefs;

        if (val.length > 1) val = val.slice(-1);
        if (!/^\d*$/.test(val)) return;

        const next = [...currentPin];
        next[idx] = val;
        setter(next);

        if (val && idx < 3) {
            refs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent, isConfirm: boolean) => {
        const currentPin = isConfirm ? confirmPin : pin;
        const refs = isConfirm ? confirmRefs : pinRefs;

        if (e.key === 'Backspace' && !currentPin[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleNext = () => {
        if (pin.some(d => !d)) {
            toast.error("Please enter a 4-digit PIN");
            return;
        }
        setStep(2);
    };

    const handleSave = async () => {
        const pinStr = pin.join('');
        const confirmStr = confirmPin.join('');

        if (pinStr !== confirmStr) {
            toast.error("PINs do not match");
            setConfirmPin(['', '', '', '']);
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            await userService.setupPin({ pin: pinStr });
            toast.success("Transaction PIN updated successfully");
            navigate('/app/profile/security');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update PIN");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => step === 2 ? setStep(1) : navigate('/app/profile/security')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {step === 1 ? 'Setup Transaction PIN' : 'Confirm Your PIN'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {step === 1 ? 'Create a secure 4-digit code' : 'Verify the code matches'}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <ShieldCheck size={32} />
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {(step === 1 ? pin : confirmPin).map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (step === 1 ? pinRefs : confirmRefs).current[idx] = el!}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value, step === 2)}
                            onKeyDown={(e) => handleKeyDown(idx, e, step === 2)}
                            className="w-14 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        />
                    ))}
                </div>

                <div className="space-y-4">
                    {step === 1 ? (
                        <SubmitButton onClick={handleNext} disabled={pin.some(d => !d)}>
                             Continue
                        </SubmitButton>
                    ) : (
                        <SubmitButton onClick={handleSave} loading={loading} disabled={confirmPin.some(d => !d)}>
                             <div className="flex items-center justify-center gap-2">
                                <Save size={16} />
                                <span>Save PIN</span>
                             </div>
                        </SubmitButton>
                    )}
                    
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        This PIN will be required for all transactions
                    </p>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-slate-950 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 border border-slate-800 shrink-0">
                    <Lock size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] text-white font-bold uppercase tracking-widest">Zero-Persistence Policy</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Your PIN is encrypted during transmission and is NEVER stored locally on this device or in your browser memory.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserPinSetupPage;
