import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    ShieldCheck, 
    Lock,
    ArrowRight
} from 'lucide-react';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../../components/common/SiteLogo';

const UserOtpPage: React.FC = () => {
    const { settings } = useSiteSettings();
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-mint/50 flex flex-col font-sans">
            {/* Header */}
            <header className="w-full h-16 bg-surface border-b border-slate-100 flex items-center justify-between px-6 sm:px-12">
                <div className="flex items-center gap-3">
                    <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="w-8 h-8 rounded-lg object-contain" />
                    <span className="text-xl font-black text-brand-navy tracking-tight uppercase">{settings.SITE_NAME}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm font-medium text-slate-500">Need help?</span>
                    <Link to="/login" className="bg-brand-emerald hover:bg-brand-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-btn">
                        Log In
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-surface rounded-2xl shadow-card p-6 sm:p-8 border border-slate-100 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-14 h-14 bg-brand-mint rounded-full flex items-center justify-center border border-brand-emerald/20">
                            <ShieldCheck className="text-brand-emerald w-7 h-7" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-brand-navy mb-1">Verify your identity</h1>
                    <p className="text-slate-500 font-medium mb-6 max-w-sm mx-auto text-sm">
                        Enter the 6-digit code sent to your email
                    </p>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-between gap-2 sm:gap-4 max-w-xs mx-auto mb-2">
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
                                    className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold py-3 rounded-xl shadow-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
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
                                    className={`font-bold transition-colors ${timer > 0 ? 'text-slate-300' : 'text-brand-emerald hover:text-brand-emerald-600'}`}
                                >
                                    Resend code {timer > 0 && `in 0:${timer.toString().padStart(2, '0')}`}
                                </button>
                            </p>
                        </div>

                        <div className="pt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                            <Lock size={14} />
                            <span>Secure, encrypted authentication by {settings.SITE_NAME}</span>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-5 text-center border-t border-slate-100 bg-surface">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} {settings.SITE_NAME}. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
};

export default UserOtpPage;
