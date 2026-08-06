import React, { useState, useEffect, useRef } from 'react';
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
import { getBanks, resolveAccount } from '../../services/wallet/walletService';
import { toast } from 'react-hot-toast';

const UserLinkedAccountsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    
    // Bank specific states
    const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<{name: string, code: string}[]>([]);
    const [bankSearch, setBankSearch] = useState('');
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [selectedBankCode, setSelectedBankCode] = useState('');
    const [bankName, setBankName] = useState('');

    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [resolving, setResolving] = useState(false);
    
    const { linkedAccounts, fetchLinkedAccounts, addAccount, removeAccount, loading } = useWalletStore();

    useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    // Fetch banks when modal opens
    useEffect(() => {
        if (isAdding) {
            getBanks().then(data => {
                setBanks(data);
                setFilteredBanks(data);
            }).catch(() => toast.error('Failed to load banks'));
        } else {
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            setSelectedBankCode('');
            setBankSearch('');
            setShowBankDropdown(false);
        }
    }, [isAdding]);

    // Handle bank search filter
    useEffect(() => {
        setFilteredBanks(banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())));
    }, [bankSearch, banks]);

    // Auto resolve account number
    useEffect(() => {
        if (accountNumber.length === 10 && selectedBankCode) {
            setResolving(true);
            setAccountName('');
            resolveAccount(accountNumber, selectedBankCode).then(res => {
                setAccountName(res.account_name);
            }).catch(err => {
                toast.error(err.response?.data?.message || 'Could not verify account details.');
            }).finally(() => {
                setResolving(false);
            });
        } else {
            setAccountName(''); // Clear when typing
        }
    }, [accountNumber, selectedBankCode]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!accountName) {
                toast.error("Account name must be verified first.");
                return;
            }
            const isDuplicate = linkedAccounts.some(acc => acc.accountNumber === accountNumber);
            if (isDuplicate) {
                toast.error("This account number is already linked.");
                return;
            }
            await addAccount({ bankCode: selectedBankCode, bankName, accountNumber, accountName });
            setIsAdding(false);
            toast.success('Bank account linked successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to link account. Please check details.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to unlink this bank account?')) {
            await removeAccount(id);
            toast('Account unlinked.', { icon: 'ℹ️' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-4 bg-surface border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                        <ArrowLeft size={20} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Linked Hubs</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your verified withdrawal destinations.</p>
                    </div>
                </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="hidden sm:flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-btn"
                    >
                        <Plus size={18} />
                        <span>Add New Bank</span>
                    </button>
            </div>

            {isAdding ? (
                <div className="bg-surface border border-slate-50 rounded-2xl p-6 space-y-6 shadow-sm animate-in zoom-in-95 duration-500 relative">
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

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={bankSearch}
                                    onChange={(e) => {
                                        setBankSearch(e.target.value);
                                        setShowBankDropdown(true);
                                    }}
                                    onFocus={() => setShowBankDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowBankDropdown(false), 200)}
                                    placeholder="Search bank..."
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                                />
                                {showBankDropdown && filteredBanks.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 max-h-60 overflow-y-auto bg-surface border border-slate-100 rounded-2xl shadow-xl top-full left-0">
                                        {filteredBanks.slice(0, 50).map(bank => (
                                            <div 
                                                key={bank.code}
                                                onClick={() => {
                                                    setSelectedBankCode(bank.code);
                                                    setBankName(bank.name);
                                                    setBankSearch(bank.name);
                                                    setShowBankDropdown(false);
                                                }}
                                                className="p-4 hover:bg-emerald-50 dark:hover:bg-brand-mint cursor-pointer text-slate-700 font-bold text-sm border-b border-slate-50 last:border-b-0 transition-colors"
                                            >
                                                {bank.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                <input 
                                    required
                                    type="text"
                                    maxLength={10}
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder="10-digit number"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Holder Name (Verified)</label>
                            <div className="relative">
                                <input 
                                    required
                                    readOnly
                                    type="text" 
                                    value={accountName}
                                    placeholder={resolving ? "Verifying identity..." : "Auto-filled upon verification"}
                                    className="w-full bg-slate-100 border-2 border-slate-50 rounded-2xl p-5 font-bold text-slate-500 outline-none transition-all cursor-not-allowed"
                                />
                                {resolving && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-brand-mint/60 rounded-2xl border border-brand-emerald/20 text-slate-600">
                            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                                Your withdrawal node must match your KYC identity for successful settlements.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || resolving || !accountName}
                            className="w-full bg-brand-emerald text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Committing Node...' : 'Establish Secure Link'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {linkedAccounts.length > 0 ? (
                        <div className="bg-surface border border-slate-50 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Bank</th>
                                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Account Number</th>
                                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Account Holder</th>
                                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {linkedAccounts.map((acc) => (
                                            <tr key={acc._id} className="transition-colors hover:bg-slate-50/60 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                            <Building2 size={18} />
                                                        </div>
                                                        <span className="font-bold text-slate-900 text-sm">{acc.bankName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-600 text-sm tracking-widest">
                                                    {acc.accountNumber.replace(/.(?=.{4})/g, '*')}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700 text-sm">{acc.accountName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest border border-emerald-100">
                                                        <CheckCircle2 size={10} />
                                                        Verified
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(acc._id)}
                                                        className="p-2.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Unlink account"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full p-4 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-slate-400 hover:text-emerald-500 border-t border-slate-100"
                            >
                                <Plus size={16} />
                                <span className="font-bold text-xs uppercase tracking-[0.2em]">Add Another Bank</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-surface border border-slate-50 rounded-2xl p-8 text-center space-y-6 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                                <Building2 size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">No Settlement Hubs</h3>
                                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">Link a verified bank account to enable professional withdrawal protocols.</p>
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="bg-brand-emerald text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn"
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
