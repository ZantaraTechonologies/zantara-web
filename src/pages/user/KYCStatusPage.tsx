import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ArrowLeft, 
    ShieldCheck, 
    AlertCircle,
    UserCheck,
    RefreshCw
} from 'lucide-react';
import { SubmitButton } from '../../components/buy/Buy';

const KYCStatusPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [status, setStatus] = useState<'pending' | 'verified' | 'rejected' | 'none'>('pending');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await userService.getKYCStatus();
                setStatus(res.data?.status || 'none');
                setMessage(res.data?.message || '');
            } catch (err) {
                // For demo, if location state has info, use it
                if (location.state?.status) {
                    setStatus(location.state.status);
                } else {
                    setStatus('pending'); // Default to pending if we just uploaded
                }
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [location.state]);

    const renderContent = () => {
        switch (status) {
            case 'verified':
                return (
                    <div className="text-center space-y-6 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-100/50">
                            <ShieldCheck size={48} />
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Verified</h2>
                             <p className="text-slate-500 font-medium">Your account has been upgraded to Level 2.</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl inline-flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                            <UserCheck size={16} />
                            Daily Limit: ₦500,000.00
                        </div>
                        <div className="pt-4">
                            <SubmitButton onClick={() => navigate('/app/profile')}>
                                Back to Profile
                            </SubmitButton>
                        </div>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="text-center space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-100/50">
                            <XCircle size={48} />
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verification Failed</h2>
                             <p className="text-red-600/70 font-medium">{message || "The documents provided were not clear or didn't match our records."}</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                             <SubmitButton onClick={() => navigate('/app/kyc/upload')}>
                                Try Again
                             </SubmitButton>
                             <button 
                                onClick={() => navigate('/app/profile')}
                                className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                             >
                                Return to Profile
                             </button>
                        </div>
                    </div>
                );
            default: // pending
                return (
                    <div className="text-center space-y-6 animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-orange-100/50 relative">
                             <Clock size={48} />
                             <div className="absolute inset-0 rounded-2xl border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verification Pending</h2>
                             <p className="text-slate-500 font-medium">Our compliance team is currently reviewing your documents.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-left">
                            <AlertCircle size={20} className="text-orange-500 shrink-0" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Review usually takes 2-6 hours. We will notify you via SMS and Email once the process is complete.
                            </p>
                        </div>
                        <div className="pt-4">
                             <SubmitButton onClick={() => navigate('/app/profile')}>
                                Return to Profile
                             </SubmitButton>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-md mx-auto py-12">
            <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-20"></div>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <RefreshCw size={32} className="text-slate-200 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Identity Node...</p>
                    </div>
                ) : renderContent()}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Verification Channel</span>
            </div>
        </div>
    );
};

export default KYCStatusPage;
