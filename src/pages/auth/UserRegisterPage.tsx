import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    User, 
    Mail, 
    Phone, 
    Lock, 
    Briefcase
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const UserRegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        agreeToTerms: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            toast.error('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        try {
            // Mapping UI fields to backend expectation if needed
            // Based on authService.ts: { name, email, phone, password }
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            toast.success('Registration successful! Please verify your identity.');
            navigate('/otp'); // Navigate to OTP verification page
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Header / Logo */}
            <div className="mb-8 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center shadow-sm">
                    <div className="w-4 h-4 border-2 border-slate-900 rounded-sm"></div>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Create your account</h1>
                    <p className="text-slate-500 font-medium">Join over 10,000+ professionals on Zantara.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
                                    placeholder="John Doe"
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
                        className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                        ) : (
                            "COMPLETE REGISTRATION"
                        )}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-400">
                            <span className="bg-white px-4">Or register with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-70" />
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                        >
                            <Briefcase size={18} className="text-slate-400" />
                            <span>SSO</span>
                        </button>
                    </div>

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
