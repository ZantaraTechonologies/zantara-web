import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    User, 
    Mail, 
    Phone, 
    Lock, 
    UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const UserRegisterPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        referralCode: '',
        agreeToTerms: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { register } = useAuthStore();
    const navigate = useNavigate();

    // Capture referral code from URL
    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setFormData(prev => ({ ...prev, referralCode: ref }));
            console.info(`[Auth] Referral code detected from URL: ${ref}`);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errorMsg) setErrorMsg('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.info(`[Auth] Attempting registration for: ${formData.email}`);

        if (!formData.agreeToTerms) {
            toast.error('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                referralCode: formData.referralCode
            });
            console.info(`[Auth] Registration successful for: ${formData.email}`);
            toast.success('Registration successful! Welcome to Zantara.');
            navigate('/app/dashboard');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
            console.error(`[Auth] Registration error:`, err);
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Header / Logo */}
            <div className="mb-8 flex items-center gap-3">
                <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
                    <p className="text-slate-500 font-medium text-sm">Join the growing community of professionals on Zantara.</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <span className="mt-0.5 animate-pulse">⚠️</span>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="Your Full Name"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Referral Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Referral Code (Optional)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <UserPlus size={18} />
                                </div>
                                <input
                                    name="referralCode"
                                    type="text"
                                    value={formData.referralCode}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="Enter referral code"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="agreeToTerms"
                            name="agreeToTerms"
                            type="checkbox"
                            required
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-500 border-slate-200 rounded-lg focus:ring-emerald-500/20 cursor-pointer"
                        />
                        <label htmlFor="agreeToTerms" className="ml-3 block text-sm font-medium text-slate-600">
                            I agree to the <Link to="/terms" className="text-emerald-500 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-500 font-bold hover:underline">Privacy Policy</Link>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                        ) : (
                            "COMPLETE REGISTRATION"
                        )}
                    </button>

                    <p className="text-center text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-500 font-bold hover:text-emerald-600 transition-colors">
                            Log in here
                        </Link>
                    </p>
                </form>
            </div>

            {/* Footer Links */}
            <div className="mt-12 flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Link to="/help" className="hover:text-slate-600 transition-colors">Help</Link>
                <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
                <Link to="/status" className="hover:text-slate-600 transition-colors">Status</Link>
            </div>
            <p className="mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                © 2024 Zantara Technologies Inc. All rights reserved.
            </p>
        </div>
    );
};

export default UserRegisterPage;

