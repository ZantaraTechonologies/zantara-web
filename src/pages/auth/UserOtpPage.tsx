import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    ShieldCheck, 
    Lock,
    ArrowRight
} from 'lucide-react';

const UserOtpPage: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    // Timer logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Please enter the full 6-digit code');
            return;
        }

        setIsLoading(true);
        // Simulation of verification
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Identity verified successfully!');
            navigate('/app/wallet'); 
        }, 1500);
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(59);
        toast.info('New OTP sent to your email');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="w-full h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-12">
                <div className="flex items-center gap-3">
                    <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg" />
                    <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm font-medium text-slate-500">Need help?</span>
                    <Link to="/login" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10">
                        Log In
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                            <ShieldCheck className="text-emerald-500 w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Verify your identity</h1>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                        Enter the 6-digit code sent to your email
                    </p>

                    <form onSubmit={handleVerify} className="space-y-10">
                        <div className="flex justify-between gap-2 sm:gap-4 max-w-xs mx-auto">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { inputRefs.current[idx] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 bg-slate-50 border border-slate-100 rounded-xl text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                            ) : (
                                "Verify and Continue"
                            )}
                        </button>

                        <div className="pt-2">
                            <p className="text-slate-500 font-medium">
                                Didn't receive the code?{' '}
                                <button 
                                    type="button"
                                    onClick={handleResend}
                                    disabled={timer > 0}
                                    className={`font-bold transition-colors ${timer > 0 ? 'text-slate-300' : 'text-emerald-500 hover:text-emerald-600'}`}
                                >
                                    Resend code {timer > 0 && `in 0:${timer.toString().padStart(2, '0')}`}
                                </button>
                            </p>
                        </div>

                        <div className="pt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                            <Lock size={14} />
                            <span>Secure, encrypted authentication by Zantara</span>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center border-t border-slate-100 bg-white">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    © 2024 ZANTARA TECHNOLOGIES. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
};

export default UserOtpPage;
