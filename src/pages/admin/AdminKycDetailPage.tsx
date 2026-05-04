import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Shield, 
    User as UserIcon, 
    CheckCircle2, 
    XCircle,
    Clock,
    FileText,
    ExternalLink,
    Loader2
} from 'lucide-react';
import * as adminService from '../../services/admin/adminService';
import { CardSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminKycDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [kyc, setKyc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        if (id) loadKyc(id);
    }, [id]);

    const loadKyc = async (kycId: string) => {
        setLoading(true);
        try {
            const response = await adminService.fetchKycDetail(kycId);
            setKyc(response.data);
        } catch (err) {
            toast.error("KYC request not found");
            navigate('/admin/personnel/hub', { state: { activeTab: 'verification' } });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!kyc || processing) return;
        if (!window.confirm("Are you sure you want to approve this KYC? This will upgrade the user's tier.")) return;

        setProcessing(true);
        try {
            await adminService.approveKyc(kyc._id, "Approved by admin");
            toast.success("KYC Approved Successfully");
            navigate('/admin/personnel/hub', { state: { activeTab: 'verification' } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to approve KYC");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!kyc || processing || !rejectionReason) return;

        setProcessing(true);
        try {
            await adminService.rejectKyc(kyc._id, rejectionReason);
            toast.success("KYC Rejected");
            navigate('/admin/personnel/hub', { state: { activeTab: 'verification' } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reject KYC");
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    if (loading) return <div className="p-12"><CardSkeleton /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <button
                    onClick={() => navigate('/admin/personnel/hub', { state: { activeTab: 'verification' } })}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Node</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        kyc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        kyc.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                        {kyc.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Document View */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl group relative">
                        {kyc.documentImage ? (
                            <>
                                <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a 
                                        href={kyc.documentImage} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-3 bg-white text-slate-950 rounded-2xl shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                    >
                                        <ExternalLink size={14} />
                                        View Full Image
                                    </a>
                                </div>
                                <img 
                                    src={kyc.documentImage} 
                                    alt="KYC Document" 
                                    className="w-full h-auto min-h-[400px] object-contain bg-black/40"
                                />
                            </>
                        ) : (
                            <div className="w-full min-h-[400px] flex flex-col items-center justify-center space-y-4 bg-slate-950/20">
                                <FileText size={64} className="text-slate-800" />
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No Document Image Uploaded</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16"></div>
                        
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Shield size={24} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white italic tracking-tight">Identity Profile</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Verification Node Alpha</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">User Name</p>
                                            <p className="text-base font-black text-white italic">{kyc.userId?.name}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/admin/users/${kyc.userId?._id}`)}
                                            className="text-indigo-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Document Type</p>
                                            <p className="text-sm font-black text-white">{kyc.documentType}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Tier Level</p>
                                            <p className="text-sm font-black text-white">Level {kyc.tier}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Document Number</p>
                                        <p className="text-sm font-mono text-slate-300 tracking-wider">{kyc.documentNumber}</p>
                                    </div>
                                    {kyc.address && (
                                        <div className="space-y-1 pt-2 border-t border-white/5">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Residential Address</p>
                                            <p className="text-sm text-slate-300 leading-relaxed font-medium italic">{kyc.address}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-slate-500">
                                    <Clock size={16} />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">
                                        Submitted: {new Date(kyc.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {kyc.status === 'pending' && (
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <button 
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="w-full py-5 bg-emerald-500 text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                >
                                    {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Approve Identity
                                </button>
                                <button 
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={processing}
                                    className="w-full py-5 bg-white/5 text-rose-500 border border-rose-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <XCircle size={18} />
                                    Reject Request
                                </button>
                            </div>
                        )}

                        {kyc.status === 'rejected' && kyc.rejectionReason && (
                            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-2">
                                <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest">Rejection Reason</p>
                                <p className="text-xs text-rose-300 font-medium leading-relaxed uppercase tracking-tighter">{kyc.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tight">Rejection Protocol</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Provide a reason for the user</p>
                        </div>

                        <div className="space-y-4">
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-rose-500/50 min-h-[150px] transition-all"
                            />
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 py-4 bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleReject}
                                    disabled={!rejectionReason || processing}
                                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-400 disabled:opacity-50"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKycDetailPage;
