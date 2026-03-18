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
import { toast } from 'react-toastify';

const UserVirtualAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const { virtualAccount, fetchVirtualAccount, loading } = useWalletStore();

    useEffect(() => {
        fetchVirtualAccount();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Address copied to clipboard', {
            icon: <Copy size={16} />
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Direct Funding</h1>
                    <p className="text-slate-500 font-medium italic">Your dedicated high-speed settlement node.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Account Details Card */}
                <div className="bg-slate-950 rounded-[3rem] p-10 sm:p-12 text-white space-y-12 relative overflow-hidden shadow-2xl shadow-slate-900/40">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Building2 size={32} />
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">Node Status</p>
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="font-black text-xs">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="space-y-2 group">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Bank Institution</p>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black">{virtualAccount?.bankName || 'WEMA BANK PLC'}</h2>
                                <button onClick={() => copyToClipboard(virtualAccount?.bankName || 'WEMA BANK PLC')} className="text-slate-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Account Identifier</p>
                            <div className="flex items-center justify-between">
                                <h2 className="text-4xl font-black tracking-[0.1em] text-emerald-400">{virtualAccount?.accountNumber || '0123456789'}</h2>
                                <button onClick={() => copyToClipboard(virtualAccount?.accountNumber || '0123456789')} className="text-emerald-400 hover:text-white transition-colors"><Copy size={20} /></button>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Account Name</p>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight">{virtualAccount?.accountName || 'Zantara / Alex Johnson'}</h2>
                                <button onClick={() => copyToClipboard(virtualAccount?.accountName || 'Zantara / Alex Johnson')} className="text-slate-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span>PCDISC Compliant</span>
                        </div>
                        <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <Download size={14} />
                            <span>Export Node Data</span>
                        </button>
                    </div>
                </div>

                {/* Instructions & Notes */}
                <div className="space-y-10">
                    <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex items-start gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                            <Zap size={32} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-slate-900">Instant Settlement</h3>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                Transfers to this specific account number are automatically tracked and credited to your Zantara wallet within <span className="text-emerald-600 font-black">60 seconds</span>.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 px-4">
                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">Node Protocols</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'No Fee Funding', desc: 'Direct transfers to this account attract 0% service charges.' },
                                { title: 'Unlimited Threshold', desc: 'Scale your operations with no daily deposit limits.' },
                                { title: 'Dynamic Tracking', desc: 'Each transaction generates a unique terminal trace for support.' }
                            ].map((p, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{p.title}</h4>
                                        <p className="text-slate-500 text-xs font-medium leading-relaxed">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-950 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950">
                                    <Info size={20} />
                                </div>
                                <span className="text-white font-bold text-sm">Need Help?</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-700 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserVirtualAccountPage;
