import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, Lock, AlertCircle } from 'lucide-react';

interface SecurePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
    loading?: boolean;
    title?: string;
    error?: string | null;
}

const SecurePinModal: React.FC<SecurePinModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    loading = false,
    title = "Transaction Security",
    error
}) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (idx: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newPin = [...pin];
        newPin[idx] = value.slice(-1);
        setPin(newPin);

        if (value && idx < 3) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pinString = pin.join('');
        if (pinString.length === 4) {
            onConfirm(pinString);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="bg-slate-950 p-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 text-center">
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto border border-slate-100 shadow-inner">
                            <Lock size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Confirm Pin</h4>
                            <p className="text-xs text-slate-500 font-medium">Please enter your 4-digit transaction secret.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-center gap-2 text-red-600 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                                <AlertCircle size={16} className="shrink-0" />
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}
                        <div className="flex justify-center gap-3">
                            {pin.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { inputRefs.current[idx] = el; }}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 bg-slate-50 border border-slate-100 rounded-xl text-center text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || pin.some(d => !d)}
                            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 disabled:opacity-30"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Authorizing...</span>
                                </div>
                            ) : (
                                "Authorize Transaction"
                            )}
                        </button>
                    </form>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Zantara Encrypted Protocol</span>
                </div>
            </div>
        </div>
    );
};

export default SecurePinModal;
