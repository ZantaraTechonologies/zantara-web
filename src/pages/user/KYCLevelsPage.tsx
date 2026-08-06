import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { 
    Shield, 
    ShieldCheck, 
    ShieldAlert, 
    ArrowLeft, 
    ChevronRight, 
    Info, 
    CheckCircle2, 
    XCircle,
    TrendingUp
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as userService from '../../services/user/userService';

const KYCLevelsPage: React.FC = () => {
    const { user } = useAuthStore();
    const { currency } = useWalletStore();
    const navigate = useNavigate();
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [kycData, setKycData] = useState<any>(null);
    const currentLevel = user?.kycLevel || 1;

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await userService.getKYCStatus();
                setKycData(res.data);
            } catch (err) {
                console.error("Failed to fetch KYC status");
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    useEffect(() => {
        const kycStatus = kycData?.status || 'none';
        const kycTier = kycData?.tier || 0;
        
        const isTier1Verified = user?.isPhoneVerified && user?.isEmailVerified;
        
        const tier1 = { 
            level: 1, 
            name: 'Starter', 
            limit: `${currency}50,000 Daily`, 
            requirements: ['Phone Verification', 'Email Verification'],
            status: isTier1Verified ? 'active' : 'available'
        };

        const tier2 = { 
            level: 2, 
            name: 'Verified', 
            limit: `${currency}500,000 Daily`, 
            requirements: ['Government ID (NIN/BVN/License)'],
            status: (user?.kycLevel >= 2) ? 'active' : (kycStatus === 'pending' && kycTier === 2 ? 'pending' : (kycStatus === 'rejected' && kycTier === 2 ? 'rejected' : 'available'))
        };

        const tier3 = { 
            level: 3, 
            name: 'Premium', 
            limit: `${currency}5,000,000 Daily`, 
            requirements: ['Utility Bill (Electricity/Water)', 'Residential Address Verification'],
            status: (user?.kycLevel >= 3) ? 'active' : (kycStatus === 'pending' && kycTier === 3 ? 'pending' : (kycStatus === 'rejected' && kycTier === 3 ? 'rejected' : (user?.kycLevel >= 2 ? 'available' : 'locked')))
        };

        setLevels([tier1, tier2, tier3]);
    }, [user, kycData]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <ShieldCheck className="text-emerald-500" />;
            case 'pending': return <TrendingUp className="text-orange-500 animate-pulse" />;
            case 'available': return <Shield className="text-blue-500" />;
            default: return <ShieldAlert className="text-slate-300" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/app/profile')}
                    className="p-2.5 bg-surface border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Identity Verification</h1>
                    <p className="text-xs text-slate-500 font-medium">Upgrade your account for higher limits and features</p>
                </div>
            </div>

            {/* Current Level Banner */}
            <div className="bg-brand-mint/60 p-5 rounded-2xl border border-brand-emerald/20 shadow-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-brand-emerald-100/60 rounded-full blur-3xl transition-all group-hover:bg-brand-emerald-100"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1.5 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="px-3 py-1 bg-brand-emerald-100 text-brand-emerald text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-emerald/20">
                                Current Status
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-brand-navy tracking-tight">Level {currentLevel} {currentLevel === 2 ? 'Verified' : 'Starter'}</h2>
                        <p className="text-slate-600 text-sm font-medium">Daily Transaction Limit: {currentLevel === 2 ? `${currency}500,000.00` : `${currency}50,000.00`}</p>
                    </div>
                    <div className="w-16 h-16 bg-brand-emerald-100/60 rounded-2xl flex items-center justify-center border border-brand-emerald/20 group-hover:rotate-6 transition-transform shrink-0">
                        <ShieldCheck size={32} className="text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Level Comparison */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Verification Tiers</h3>
                <div className="grid gap-3">
                    {levels.map((lvl, idx) => (
                        <div 
                            key={idx}
                            className={`p-5 rounded-2xl border transition-all ${lvl.status === 'active' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-surface border-slate-100'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${lvl.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        {lvl.level}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            {lvl.name} Tier
                                            {lvl.status === 'active' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{lvl.limit}</p>
                                    </div>
                                </div>
                                <div className="text-xl">
                                    {getStatusIcon(lvl.status)}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Requirements</p>
                                <div className="flex flex-wrap gap-2">
                                    {lvl.requirements.map((req: string, rIdx: number) => (
                                        <span key={rIdx} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 flex items-center gap-1.5">
                                            {lvl.status === 'active' ? <CheckCircle2 size={10} className="text-emerald-500" /> : <Info size={10} />}
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {lvl.status === 'available' && (
                                <button 
                                    onClick={() => navigate('/app/kyc/upload', { state: { tier: lvl.level } })}
                                    className="w-full mt-4 py-3 bg-brand-emerald text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-emerald-600 transition-all shadow-btn"
                                >
                                    Upgrade to Level {lvl.level}
                                </button>
                            )}

                            {lvl.status === 'pending' && (
                                <div className="w-full mt-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs uppercase tracking-widest text-center border border-orange-100 shadow-sm">
                                    Review in Progress
                                </div>
                            )}

                            {lvl.status === 'rejected' && (
                                <div className="mt-4 space-y-2.5">
                                    <div className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest text-center border border-rose-100 shadow-sm">
                                        Verification Rejected
                                    </div>
                                    {kycData?.rejectionReason && (
                                        <p className="text-[10px] text-rose-500 font-medium px-2 italic text-center">
                                            Reason: {kycData.rejectionReason}
                                        </p>
                                    )}
                                    <button 
                                        onClick={() => navigate('/app/kyc/upload', { state: { tier: lvl.level } })}
                                        className="w-full py-3 bg-brand-emerald text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-emerald-600 transition-all shadow-btn"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50/50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100/50">
                 <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
                    KYC (Know Your Customer) is a mandatory regulatory requirement for all financial institutions in Nigeria. Verification typically takes 2-6 business hours during operation times.
                 </p>
            </div>
        </div>
    );
};

export default KYCLevelsPage;
