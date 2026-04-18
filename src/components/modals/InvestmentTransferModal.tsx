import React from 'react';
import { X, Building2, Copy, CheckCircle2, Info, Smartphone } from 'lucide-react';
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

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-950 p-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Building2 size={20} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest">Bank Transfer</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Instructions */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto shadow-inner">
                            <Smartphone size={28} />
                        </div>
                        <div className="px-4">
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                Please transfer the exact amount below to the provided account.
                            </p>
                        </div>
                    </div>

                    {/* Amount Card */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-center space-y-1 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Total Amount</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                            {details.currency || '₦'}{details.amount.toLocaleString()}
                        </h2>
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

                    {/* Waiting Notice */}
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-wider">
                            This account is dedicated to this purchase and expires in 60 minutes. Your portfolio will update automatically once the network confirms your deposit.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onClose}
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
