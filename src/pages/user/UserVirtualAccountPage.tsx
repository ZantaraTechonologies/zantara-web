import React, { useEffect } from 'react';
import { 
    ArrowLeft, 
    Building2, 
    Copy, 
    CheckCircle2, 
    Info, 
    ShieldCheck, 
    Zap,
    Download,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from "react-hot-toast";

const UserVirtualAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const { virtualAccount, fetchVirtualAccount, generateAccounts, loading } = useWalletStore();
    const [generating, setGenerating] = React.useState(false);

    useEffect(() => {
        fetchVirtualAccount();
    }, []);

    const copyToClipboard = (text: string) => {
        if (!text || text.includes('Not Generated')) return;
        navigator.clipboard.writeText(text);
        toast.success('Address copied to clipboard', {
            icon: <Copy size={16} />
        });
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            await generateAccounts();
            toast.success('Virtual accounts generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate accounts');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Direct Funding</h1>
                    <p className="text-slate-500 font-medium italic text-sm">Your dedicated high-speed settlement node.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Details Card */}
                <div className="bg-surface border border-slate-100 rounded-2xl p-6 sm:p-8 text-slate-900 space-y-6 relative overflow-hidden shadow-card">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald-100/60 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-12 h-12 bg-brand-mint/60 rounded-xl flex items-center justify-center text-brand-emerald border border-brand-emerald/20">
                            <Building2 size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-brand-emerald font-bold uppercase tracking-[0.2em] text-[9px]">Node Status</p>
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></div>
                                <span className="font-bold text-[10px]">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-5">
                        <div className="space-y-1.5 group">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Bank Institution</p>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black">{virtualAccount?.bankName || 'Not Generated'}</h2>
                                <button onClick={() => copyToClipboard(virtualAccount?.bankName || '')} className="text-slate-400 hover:text-brand-emerald transition-colors opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-1.5 group">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Account Identifier</p>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-[0.1em] ${virtualAccount?.accountNumber ? 'text-brand-emerald' : 'text-slate-700'}`}>
                                    {virtualAccount?.accountNumber || '----------'}
                                </h2>
                                {virtualAccount?.accountNumber && (
                                    <button onClick={() => copyToClipboard(virtualAccount?.accountNumber)} className="text-brand-emerald hover:text-slate-900 transition-colors"><Copy size={20} /></button>
                                )}
                            </div>
                        </div>

                        {!virtualAccount ? (
                            <button 
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full py-3.5 bg-brand-emerald hover:bg-brand-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl transition-all transform active:scale-95 shadow-btn"
                            >
                                {generating ? 'GENERATING...' : 'GENERATE VIRTUAL ACCOUNTS'}
                            </button>
                        ) : (
                            <div className="space-y-1.5 group">
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Account Name</p>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold tracking-tight">{virtualAccount?.accountName}</h2>
                                    <button onClick={() => copyToClipboard(virtualAccount?.accountName)} className="text-slate-400 hover:text-brand-emerald transition-colors opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={16} className="text-brand-emerald" />
                            <span>PCDISC Compliant</span>
                        </div>
                        <button className="text-[10px] font-black text-brand-emerald uppercase tracking-widest flex items-center gap-2 hover:text-brand-emerald-600 transition-colors">
                            <Download size={14} />
                            <span>Export Node Data</span>
                        </button>
                    </div>
                </div>

                {/* Instructions & Notes */}
                <div className="space-y-5">
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-start gap-4">
                        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                            <Zap size={24} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">Instant Settlement</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Transfers to this specific account number are automatically tracked and credited to your Zantara wallet within <span className="text-emerald-600 font-bold">60 seconds</span>.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 px-1">
                        <h3 className="font-bold text-slate-900 uppercase tracking-[0.2em] text-[10px]">Node Protocols</h3>
                        <div className="space-y-3.5">
                            {[
                                { title: 'No Fee Funding', desc: 'Direct transfers to this account attract 0% service charges.' },
                                { title: 'Unlimited Threshold', desc: 'Scale your operations with no daily deposit limits.' },
                                { title: 'Dynamic Tracking', desc: 'Each transaction generates a unique terminal trace for support.' }
                            ].map((p, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">{p.title}</h4>
                                        <p className="text-slate-500 text-xs font-medium leading-relaxed">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="bg-brand-mint/60 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-brand-mint border border-brand-emerald/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-brand-emerald rounded-xl flex items-center justify-center text-white">
                                    <Info size={18} />
                                </div>
                                <span className="text-brand-navy font-bold text-sm">Need Help?</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-400 group-hover:text-brand-emerald transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserVirtualAccountPage;
