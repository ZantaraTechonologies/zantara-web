import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    Building2, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Trash2,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-toastify';

const UserLinkedAccountsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    
    const { linkedAccounts, fetchLinkedAccounts, addAccount, removeAccount, loading } = useWalletStore();

    useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addAccount({ bankCode: '000', bankName, accountNumber, accountName });
            setIsAdding(false);
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            toast.success('Bank account linked successfully!');
        } catch (err) {
            toast.error('Failed to link account. Please check details.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to unlink this bank account?')) {
            await removeAccount(id);
            toast.info('Account unlinked.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                        <ArrowLeft size={20} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Linked Hubs</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your verified withdrawal destinations.</p>
                    </div>
                </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="hidden sm:flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} />
                        <span>Add New Bank</span>
                    </button>
            </div>

            {isAdding ? (
                <div className="bg-white border border-slate-50 rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Configure New Node</h2>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="e.g. GTBank, Kuda, Zenith"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <input 
                                    required
                                    type="text" 
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="10-digit number"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Holder Name (Verified)</label>
                            <input 
                                required
                                type="text" 
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="As it appears on your bank"
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-slate-950 rounded-2xl text-emerald-400/80">
                            <ShieldCheck size={20} className="shrink-0" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                                Your withdrawal node must match your KYC identity for successful settlements.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-30"
                        >
                            {loading ? 'Verifying Node...' : 'Establish Secure Link'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-8">
                    {linkedAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {linkedAccounts.map((acc) => (
                                <div key={acc._id} className="bg-white border border-slate-50 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm group hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <Building2 size={24} />
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(acc._id)}
                                            className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <h3 className="text-lg font-bold text-slate-900">{acc.bankName}</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-400 tracking-widest">{acc.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
                                                <CheckCircle2 size={10} />
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Holder</p>
                                        <p className="font-bold text-slate-700">{acc.accountName}</p>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={() => setIsAdding(true)}
                                className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 hover:border-emerald-200 transition-all text-slate-400 group h-full min-h-[240px]"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-xs uppercase tracking-[0.2em]">Scale Network</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-50 rounded-2xl p-12 text-center space-y-6 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                                <Building2 size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">No Settlement Hubs</h3>
                                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">Link a verified bank account to enable professional withdrawal protocols.</p>
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="bg-slate-950 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200"
                            >
                                Build First Connection
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!isAdding && linkedAccounts.length > 0 && (
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-start gap-4">
                    <AlertCircle className="text-orange-500 shrink-0 mt-1" size={20} />
                    <p className="text-xs text-orange-900 font-medium leading-relaxed">
                        Security Note: To protect your capital, Zantara imposes a 24-hour settlement lock on newly established withdrawal nodes. Please plan your transactions accordingly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserLinkedAccountsPage;
