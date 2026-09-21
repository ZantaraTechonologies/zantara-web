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
import API from '../../services/api/apiClient';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../../components/common/SiteLogo';

const UserRegisterPage: React.FC = () => {
    const { settings } = useSiteSettings();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        referrerCode: '',
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
            setFormData(prev => ({ ...prev, referrerCode: ref }));
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
            // Fetch the exact current versions + hashes from the backend (authoritative).
            // The server re-validates version/hash and derives documentId semantics.
            const docsRes = await API.get('/legal/documents/current');
            const docs: any[] = docsRes.data?.data || [];
            const legalAcceptances: Array<{ documentType: string; version: number; contentHash: string; channel: string }> = [];

            const termsDoc = docs.find(d => d.documentType === 'terms');
            const privacyDoc = docs.find(d => d.documentType === 'privacy');
            if (termsDoc && termsDoc.version && termsDoc.contentHash && termsDoc.requiresAcceptance !== false) {
                legalAcceptances.push({ documentType: 'terms', version: termsDoc.version, contentHash: termsDoc.contentHash, channel: 'web' });
            }
            if (privacyDoc && privacyDoc.version && privacyDoc.contentHash && privacyDoc.requiresAcceptance !== false) {
                legalAcceptances.push({ documentType: 'privacy', version: privacyDoc.version, contentHash: privacyDoc.contentHash, channel: 'web' });
            }

            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                referrerCode: formData.referrerCode,
                legalAcceptances
            });
            console.info(`[Auth] Registration successful for: ${formData.email}`);
            toast.success(`Registration successful! Welcome to ${settings.SITE_NAME}.`);
            navigate('/app/dashboard');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
            console.error('[Auth] Registration failed');
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-mint/50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Logo */}
            <div className="mb-5 flex items-center gap-3">
                <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="w-8 h-8 rounded-lg shadow-btn-navy object-contain" />
                <span className="text-xl font-black text-brand-navy tracking-tight uppercase">{settings.SITE_NAME}</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-xl bg-surface rounded-2xl shadow-card p-5 sm:p-6 border border-slate-100">
                <div className="text-center mb-5">
                    <h1 className="text-xl font-bold text-brand-navy mb-1">Create your account</h1>
                    <p className="text-slate-500 font-medium text-sm">Join the growing community of professionals on {settings.SITE_NAME}.</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <span className="mt-0.5 animate-pulse">⚠️</span>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                    placeholder="Your Full Name"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Referral Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Referral Code (Optional)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                    <UserPlus size={18} />
                                </div>
                                <input
                                    name="referrerCode"
                                    type="text"
                                    value={formData.referrerCode}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
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
                            className="w-5 h-5 text-brand-emerald border-slate-200 rounded-lg focus:ring-brand-emerald/20 cursor-pointer"
                        />
                        <label htmlFor="agreeToTerms" className="ml-3 block text-sm font-medium text-slate-600">
                            I agree to the <Link to="/terms" className="text-brand-emerald font-bold hover:underline">Terms of Service</Link> and acknowledge the <Link to="/privacy" className="text-brand-emerald font-bold hover:underline">Privacy Policy</Link>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            "COMPLETE REGISTRATION"
                        )}
                    </button>

                    <p className="text-center text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-emerald font-bold hover:text-brand-emerald-600 transition-colors">
                            Log in here
                        </Link>
                    </p>
                </form>
            </div>

            {/* Footer Links */}
            <div className="mt-6 flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Link to="/help" className="hover:text-brand-navy transition-colors">Help</Link>
                <Link to="/privacy" className="hover:text-brand-navy transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-brand-navy transition-colors">Terms</Link>
                <Link to="/status" className="hover:text-brand-navy transition-colors">Status</Link>
            </div>
            <p className="mt-3 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} {settings.SITE_NAME}. All rights reserved.
            </p>
        </div>
    );
};

export default UserRegisterPage;
