import React, { useState } from 'react';
import { X, Building2, Copy, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InvestmentTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    details: {
        account_number: string;
        bank_name: string;
        account_name: string;
        amount: number;
        currency?: string;
    } | null;
}

const InvestmentTransferModal: React.FC<InvestmentTransferModalProps> = ({ 
    isOpen, 
    onClose, 
    details
}) => {
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen || !details) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        });
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="p-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto shadow-inner animate-pulse">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Awaiting Payment Detection</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Our system is currently monitoring for your deposit. Once the payment is detected, your investment portfolio will be <span className="text-emerald-600 font-bold">automatically updated</span>.
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
                        >
                            Return to Portfolio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-950 p-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-tight text-white">Direct Bank Transfer</h4>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Transaction Registry</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Amount Info */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto shadow-inner">
                            <Info size={28} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900">Transfer {details.currency || '₦'}{details.amount.toLocaleString()}</h4>
                        <p className="text-xs text-slate-500 font-medium px-4">Transfer the exact amount below to secure your shares.</p>
                    </div>

                    {/* Account Details */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-5">
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(details.account_number, 'Account Number')}>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Account Number</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{details.account_number}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Copy size={18} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bank Name</p>
                                <p className="font-bold text-slate-800 text-sm italic">{details.bank_name}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Beneficiary</p>
                                <p className="font-bold text-slate-800 text-sm truncate">{details.account_name || 'Zantara Admin'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">
                            This virtual account is unique to this transaction and expires in 30 minutes. 
                            Please complete payment before closing this screen.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setSubmitted(true)}
                            className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
                        >
                            I have made the transfer
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full bg-white border border-slate-200 text-slate-400 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Zantara Secure Settlement</span>
                </div>
            </div>
        </div>
    );
};

export default InvestmentTransferModal;
