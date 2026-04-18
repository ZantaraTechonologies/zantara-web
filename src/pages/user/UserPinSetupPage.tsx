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
    const [loading, setLoading] = useState(false);

    const oldPinRefs = useRef<HTMLInputElement[]>([]);
    const pinRefs = useRef<HTMLInputElement[]>([]);
    const confirmRefs = useRef<HTMLInputElement[]>([]);

    const handleChange = (idx: number, val: string, type: 'old' | 'new' | 'confirm') => {
        const currentPin = type === 'old' ? oldPin : type === 'new' ? pin : confirmPin;
        const setter = type === 'old' ? setOldPin : type === 'new' ? setPin : setConfirmPin;
        const refs = type === 'old' ? oldPinRefs : type === 'new' ? pinRefs : confirmRefs;

        if (val.length > 1) val = val.slice(-1);
        if (!/^\d*$/.test(val)) return;

        const next = [...currentPin];
        next[idx] = val;
        setter(next);

        if (val && idx < 3) {
            refs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent, type: 'old' | 'new' | 'confirm') => {
        const currentPin = type === 'old' ? oldPin : type === 'new' ? pin : confirmPin;
        const refs = type === 'old' ? oldPinRefs : type === 'new' ? pinRefs : confirmRefs;

        if (e.key === 'Backspace' && !currentPin[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleSave = async () => {
        const newPinStr = pin.join('');
        const confirmStr = confirmPin.join('');
        const oldPinStr = oldPin.join('');

        if (hasPin && oldPin.some(d => !d)) { toast.error("Enter current PIN"); return; }
        if (pin.some(d => !d)) { toast.error("Enter new PIN"); return; }
        if (confirmPin.some(d => !d)) { toast.error("Confirm your new PIN"); return; }

        if (newPinStr !== confirmStr) {
            toast.error("New PINs do not match");
            setConfirmPin(['', '', '', '']);
            confirmRefs.current[0]?.focus();
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
        if (!hasPin) return; // If forced during setup, don't allow back to bypass routing block
        navigate('/app/profile/security');
    };

    const isSubmitDisabled = hasPin ? oldPin.some(d => !d) || pin.some(d => !d) || confirmPin.some(d => !d) : pin.some(d => !d) || confirmPin.some(d => !d);

    const renderPinInputRow = (label: string, values: string[], type: 'old' | 'new' | 'confirm', refsArray: React.MutableRefObject<HTMLInputElement[]>) => (
        <div className="mb-6 flex flex-col items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{label}</label>
            <div className="flex justify-center gap-4">
                {values.map((digit, idx) => (
                    <input
                        key={`${type}-${idx}`}
                        ref={(el) => {
                            if (el) {
                                refsArray.current[idx] = el;
                            }
                        }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value, type)}
                        onKeyDown={(e) => handleKeyDown(idx, e, type)}
                        className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xl sm:text-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                {hasPin && (
                    <button 
                        onClick={handleBack}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {hasPin ? 'Update PIN' : 'Setup Transaction PIN'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Configure your 4-digit security code
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8">
                    <ShieldCheck size={32} />
                </div>

                {hasPin && renderPinInputRow("Current PIN", oldPin, 'old', oldPinRefs)}
                {renderPinInputRow(hasPin ? "New PIN" : "New Transaction PIN", pin, 'new', pinRefs)}
                {renderPinInputRow("Confirm New PIN", confirmPin, 'confirm', confirmRefs)}

                <div className="w-full mt-4 space-y-4">
                    <SubmitButton onClick={handleSave} loading={loading} disabled={isSubmitDisabled}>
                        <div className="flex items-center justify-center gap-2">
                            <Save size={16} />
                            <span>{hasPin ? 'Update PIN' : 'Save PIN'}</span>
                        </div>
                    </SubmitButton>
                    
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
