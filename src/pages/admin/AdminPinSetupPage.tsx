import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { useAuthStore } from '../../store/auth/authStore';
import toast from 'react-hot-toast';
import { Terminal, ShieldAlert, Lock, Save, ArrowRight } from 'lucide-react';

const AdminPinSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, fetchMe } = useAuthStore();
    
    // Safety check just in case user object is lagging
    useEffect(() => {
        if (!user) fetchMe();
    }, [user, fetchMe]);

    const hasPin = user?.isPinSet;

    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState(hasPin ? 0 : 1); // 1: New, 2: Confirm (Admin intercept is almost always 1)
    const [loading, setLoading] = useState(false);

    const pinRefs = useRef<HTMLInputElement[]>([]);
    const confirmRefs = useRef<HTMLInputElement[]>([]);

    // If an admin somehow lands here and already has a pin set, boot them out
    useEffect(() => {
        if (hasPin) {
            navigate('/admin');
        }
    }, [hasPin, navigate]);

    const handleChange = (idx: number, val: string, currentStep: number) => {
        const currentPin = currentStep === 1 ? pin : confirmPin;
        const setter = currentStep === 1 ? setPin : setConfirmPin;
        const refs = currentStep === 1 ? pinRefs : confirmRefs;

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
        const currentPin = currentStep === 1 ? pin : confirmPin;
        const refs = currentStep === 1 ? pinRefs : confirmRefs;

        if (e.key === 'Backspace' && !currentPin[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (pin.some(d => !d)) { toast.error("ACCESS DENIED: INCOMPLETE CODE"); return; }
            setStep(2);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPinStr = pin.join('');
        const confirmStr = confirmPin.join('');

        if (newPinStr !== confirmStr) {
            toast.error("MISMATCH: CODES DO NOT ALIGN");
            setConfirmPin(['', '', '', '']);
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            await userService.setupPin({ pin: newPinStr });
            await fetchMe();
            toast.success("SYSTEM DIRECTIVE: OVERRIDE CODE ACTIVATED");
            navigate('/admin');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "SYSTEM FAULT: INITIALIZATION FAILED");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['JetBrains_Mono',_monospace]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
            }}></div>
            
            <div className="w-full max-w-lg relative group animate-in zoom-in-95 duration-500 fade-in">
                {/* Neon Glow Effect */}
                <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur opacity-20 transition duration-1000"></div>
                
                {/* Main Terminal Card */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                    {/* Header Bar */}
                    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-emerald-400 w-5 h-5 animate-pulse" />
                            <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">Institutional Terminal // SETUP</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-inner p-3">
                                <Lock className="text-emerald-500/80 w-10 h-10" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter text-center">
                                {step === 1 ? 'Master Override Code' : 'Verify Master Code'}
                            </h1>
                            <div className="flex items-center gap-2 text-emerald-400/60 text-[10px] font-bold tracking-[0.3em] uppercase text-center mt-2">
                                <ShieldAlert size={12} className="shrink-0" />
                                <span>Security initialization required</span>
                            </div>
                        </div>

                        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSave} className="space-y-10">
                            <div className="flex justify-center gap-4">
                                {(step === 1 ? pin : confirmPin).map((digit, idx) => (
                                    <input
                                        key={`admin-${step}-${idx}`}
                                        ref={(el) => {
                                            if (el) {
                                                if (step === 1) pinRefs.current[idx] = el;
                                                else confirmRefs.current[idx] = el;
                                            }
                                        }}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(idx, e.target.value, step)}
                                        onKeyDown={(e) => handleKeyDown(idx, e, step)}
                                        className="w-14 h-16 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (step === 1 ? pin : confirmPin).some(d => !d)}
                                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                                        Encrypting...
                                    </span>
                                ) : (
                                    <>
                                        <span>{step === 1 ? 'Continue' : 'Commit to Database'}</span>
                                        {step === 1 ? <ArrowRight size={14} /> : <Save size={14} />}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-800/50">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                                <span className="text-emerald-500">Notice:</span> This code overrides standard transaction protocols. Keep it highly secure.
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Footnote */}
                <div className="mt-6 flex justify-between items-center text-[9px] text-slate-700 font-bold uppercase tracking-widest px-4">
                    <span>Node: PROTOCOL-01</span>
                    <span>Lat: 1.2ms</span>
                    <span>© Zantara SecOps</span>
                </div>
            </div>
        </div>
    );
};

export default AdminPinSetupPage;
