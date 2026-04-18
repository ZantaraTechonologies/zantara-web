import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { useAuthStore } from '../../store/auth/authStore';
import { toast } from 'react-toastify';
import { ShieldCheck, ArrowLeft, Lock, Save, Key } from 'lucide-react';
import { SubmitButton } from '../../components/buy/Buy';

const UserPinSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, fetchMe } = useAuthStore();
    
    // Safety check just in case user object is lagging
    useEffect(() => {
        if (!user) fetchMe();
    }, [user, fetchMe]);

    const hasPin = user?.isPinSet;

    const [oldPin, setOldPin] = useState(['', '', '', '']);
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(hasPin ? 0 : 1); // 0: Old, 1: New, 2: Confirm
    const [loading, setLoading] = useState(false);

    const oldPinRefs = useRef<HTMLInputElement[]>([]);
    const pinRefs = useRef<HTMLInputElement[]>([]);
    const confirmRefs = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        // Reset steps if hasPin state changes dynamically
        if (hasPin !== undefined) {
            setStep(hasPin ? 0 : 1);
        }
    }, [hasPin]);

    const handleChange = (idx: number, val: string, currentStep: number) => {
        const currentPin = currentStep === 0 ? oldPin : currentStep === 1 ? pin : confirmPin;
        const setter = currentStep === 0 ? setOldPin : currentStep === 1 ? setPin : setConfirmPin;
        const refs = currentStep === 0 ? oldPinRefs : currentStep === 1 ? pinRefs : confirmRefs;

        if (val.length > 1) val = val.slice(-1);
        if (!/^\d*$/.test(val)) return;

        const next = [...currentPin];
        next[idx] = val;
        setter(next);

        if (val && idx < 3) {
            refs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent, currentStep: number) => {
        const currentPin = currentStep === 0 ? oldPin : currentStep === 1 ? pin : confirmPin;
        const refs = currentStep === 0 ? oldPinRefs : currentStep === 1 ? pinRefs : confirmRefs;

        if (e.key === 'Backspace' && !currentPin[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleNext = () => {
        if (step === 0) {
            if (oldPin.some(d => !d)) { toast.error("Enter current PIN"); return; }
            setStep(1);
        } else if (step === 1) {
            if (pin.some(d => !d)) { toast.error("Enter new PIN"); return; }
            setStep(2);
        }
    };

    const handleSave = async () => {
        const newPinStr = pin.join('');
        const confirmStr = confirmPin.join('');
        const oldPinStr = oldPin.join('');

        if (newPinStr !== confirmStr) {
            toast.error("New PINs do not match");
            setConfirmPin(['', '', '', '']);
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            if (hasPin) {
                await userService.updatePin({ oldPin: oldPinStr, newPin: newPinStr });
            } else {
                await userService.setupPin({ pin: newPinStr });
            }
            await fetchMe();
            toast.success(hasPin ? "Transaction PIN updated successfully" : "Transaction PIN created successfully");
            if (hasPin) {
                navigate('/app/profile/security');
            } else {
                navigate('/app/dashboard');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update PIN");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        else if (step === 1 && hasPin) setStep(0);
        else navigate('/app/profile/security');
    };

    return (
        <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBack}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {step === 0 ? 'Current PIN' : step === 1 ? (hasPin ? 'New Transaction PIN' : 'Setup Transaction PIN') : 'Confirm Your PIN'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {step === 0 ? 'Enter your existing 4-digit code' : step === 1 ? 'Create a secure 4-digit code' : 'Verify the new code matches'}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 animate-pulse">
                    {step === 0 ? <Key size={32} /> : <ShieldCheck size={32} />}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {(step === 0 ? oldPin : step === 1 ? pin : confirmPin).map((digit, idx) => (
                        <input
                            key={`${step}-${idx}`}
                            ref={(el) => {
                                if (el) {
                                    if (step === 0) oldPinRefs.current[idx] = el;
                                    else if (step === 1) pinRefs.current[idx] = el;
                                    else confirmRefs.current[idx] = el;
                                }
                            }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value, step)}
                            onKeyDown={(e) => handleKeyDown(idx, e, step)}
                            className="w-14 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        />
                    ))}
                </div>

                <div className="w-full space-y-4">
                    {step === 2 ? (
                        <SubmitButton onClick={handleSave} loading={loading} disabled={confirmPin.some(d => !d)}>
                             <div className="flex items-center justify-center gap-2">
                                <Save size={16} />
                                <span>{hasPin ? 'Update PIN' : 'Save PIN'}</span>
                             </div>
                        </SubmitButton>
                    ) : (
                        <SubmitButton onClick={handleNext} disabled={(step === 0 ? oldPin : pin).some(d => !d)}>
                             Continue
                        </SubmitButton>
                    )}
                    
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-4 block">
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
