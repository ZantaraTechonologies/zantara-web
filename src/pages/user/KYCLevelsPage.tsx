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
        if (!levels.length && !kycData && !loading) return;

        const kycStatus = kycData?.status || 'none';
        const kycTier = kycData?.tier || 1;
        
        const tier1 = { 
            level: 1, 
            name: 'Starter', 
            limit: `${currency}50,000 Daily`, 
            requirements: ['Phone Verification', 'Email Verification'],
            status: 'active'
        };

        const tier2 = { 
            level: 2, 
            name: 'Verified', 
            limit: `${currency}500,000 Daily`, 
            requirements: ['Government ID (NIN/BVN)', 'Residential Address'],
            status: (user?.kycLevel >= 2) ? 'active' : (kycStatus === 'pending' && kycTier === 2 ? 'pending' : 'available')
        };

        const tier3 = { 
            level: 3, 
            name: 'Premium', 
            limit: `${currency}5,000,000 Daily`, 
            requirements: ['Utility Bill', 'Face Verification'],
            status: (user?.kycLevel >= 3) ? 'active' : (kycStatus === 'pending' && kycTier === 3 ? 'pending' : (user?.kycLevel >= 2 ? 'available' : 'locked'))
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
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/profile')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Verification</h1>
                    <p className="text-sm text-slate-500 font-medium">Upgrade your account for higher limits and features</p>
                </div>
            </div>

            {/* Current Level Banner */}
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:bg-emerald-500/20"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                Current Status
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Level {currentLevel} {currentLevel === 2 ? 'Verified' : 'Starter'}</h2>
                        <p className="text-slate-400 text-sm font-medium">Daily Transaction Limit: {currentLevel === 2 ? `${currency}500,000.00` : `${currency}50,000.00`}</p>
                    </div>
                    <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                        <ShieldCheck size={48} className="text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Level Comparison */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Verification Tiers</h3>
                <div className="grid gap-4">
                    {levels.map((lvl, idx) => (
                        <div 
                            key={idx}
                            className={`p-6 rounded-3xl border transition-all ${lvl.status === 'active' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${lvl.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
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
                                <div className="text-2xl">
                                    {getStatusIcon(lvl.status)}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Requirements</p>
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
                                    onClick={() => navigate('/app/kyc/upload')}
                                    className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
                                >
                                    Upgrade to Level {lvl.level}
                                </button>
                            )}

                            {lvl.status === 'pending' && (
                                <div className="w-full mt-6 py-4 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs uppercase tracking-widest text-center border border-orange-100 shadow-sm">
                                    Review in Progress
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50/50 p-6 rounded-2xl flex items-start gap-4 border border-blue-100/50">
                 <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
                    KYC (Know Your Customer) is a mandatory regulatory requirement for all financial institutions in Nigeria. Verification typically takes 2-6 business hours during operation times.
                 </p>
            </div>
        </div>
    );
};

export default KYCLevelsPage;
