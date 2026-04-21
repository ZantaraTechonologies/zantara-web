import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    RefreshCcw, 
    Shield, 
    Globe, 
    Key, 
    Activity,
    Wallet,
    ChevronRight,
    Search,
    Cpu,
    CheckCircle2,
    XCircle,
    Code
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import { CardSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';

interface Provider {
    _id: string;
    name: string;
    adapterType: 'vtpass' | 'vas2nets' | 'universal';
    baseUrl: string;
    apiKey: string;
    secretKey?: string;
    publicKey?: string;
    status: 'active' | 'inactive' | 'maintenance';
    balance: number;
    lastBalanceCheck?: string;
    metadata?: any;
}

const AdminProvidersPage: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Partial<Provider> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/providers');
            setProviders(res.data.data);
        } catch (err) {
            toast.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckBalance = async (id: string) => {
        try {
            toast.loading("Querying vendor balance...", { id: 'balance-check' });
            const res = await apiClient.get(`/admin/providers/${id}/balance`);
            toast.success(`Current Balance: ₦${res.data.balance.toLocaleString()}`, { id: 'balance-check' });
            loadProviders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Balance check failed", { id: 'balance-check' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingProvider?._id) {
                await apiClient.put(`/admin/providers/${editingProvider._id}`, editingProvider);
                toast.success("Provider updated successfully");
            } else {
                await apiClient.post('/admin/providers', editingProvider);
                toast.success("New provider integrated");
            }
            setIsModalOpen(false);
            loadProviders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to disconnect this provider?")) return;
        try {
            await apiClient.delete(`/admin/providers/${id}`);
            toast.success("Provider removed");
            loadProviders();
        } catch (err) {
            toast.error("Failed to remove provider");
        }
    };

    if (loading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">Vendor Management</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Configure & Monitor External API Gates</p>
                </div>

                <button 
                    onClick={() => { setEditingProvider({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={16} />
                    Integrate New Provider
                </button>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {providers.map((provider) => (
                    <div key={provider._id} className="group relative bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-3xl p-8 transition-all duration-500">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{provider.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            provider.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                            provider.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            <Activity size={10} />
                                            {provider.status}
                                        </span>
                                        <span className="text-white/20 text-xs">•</span>
                                        <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            <Globe size={10} />
                                            API Gateway Ready
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => { setEditingProvider(provider); setIsModalOpen(true); }}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(provider._id)}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 group-hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Wallet Balance</span>
                                    <Wallet size={12} className="text-emerald-500" />
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-2xl font-black text-white tracking-tighter">₦{provider.balance?.toLocaleString() || '0'}</h4>
                                    <button 
                                        onClick={() => handleCheckBalance(provider._id)}
                                        className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-500 transition-all"
                                    >
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                                {provider.lastBalanceCheck && (
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-2 tracking-widest">Last Check: {new Date(provider.lastBalanceCheck).toLocaleString()}</p>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 group-hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">API Endpoint</span>
                                    <Shield size={12} className="text-blue-500" />
                                </div>
                                <p className="text-xs font-mono text-slate-400 truncate mt-1">{provider.baseUrl}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Connection Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 pb-4 flex items-center justify-between shrink-0 border-b border-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{editingProvider?._id ? 'Update Provider' : 'Integrate Provider' }</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure API authentication parameters</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider Label</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. VTPass, Dorosub"
                                        value={editingProvider?.name || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base URL</label>
                                    <input 
                                        type="url" 
                                        required
                                        placeholder="https://api.provider.com/v1"
                                        value={editingProvider?.baseUrl || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, baseUrl: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public / API Key</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required
                                        value={editingProvider?.apiKey || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, apiKey: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                </div>
                            </div>

                            {(editingProvider?.adapterType === 'vtpass' || editingProvider?.adapterType === 'universal') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secret Key (optional)</label>
                                        <input 
                                            type="password" 
                                            value={editingProvider?.secretKey || ''}
                                            onChange={(e) => setEditingProvider({...editingProvider, secretKey: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public Key (optional)</label>
                                        <input 
                                            type="text" 
                                            value={editingProvider?.publicKey || ''}
                                            onChange={(e) => setEditingProvider({...editingProvider, publicKey: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adapter Type</label>
                                    <select 
                                        value={editingProvider?.adapterType || 'vtpass'}
                                        onChange={(e: any) => setEditingProvider({...editingProvider, adapterType: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none"
                                    >
                                        <option value="vtpass" className="bg-slate-900">VTPass (Official)</option>
                                        <option value="vas2nets" className="bg-slate-900">Vas2Nets (Legacy)</option>
                                        <option value="universal" className="bg-slate-900">Universal (Zero-Code)</option>
                                    </select>
                                </div>
                                <div className="space_y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Status</label>
                                    <select 
                                        value={editingProvider?.status || 'active'}
                                        onChange={(e: any) => setEditingProvider({...editingProvider, status: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none"
                                    >
                                        <option value="active" className="bg-slate-900">Online & Active</option>
                                        <option value="maintenance" className="bg-slate-900">System Maintenance</option>
                                        <option value="inactive" className="bg-slate-900">Offline / Disabled</option>
                                    </select>
                                </div>
                            </div>

                            {editingProvider?.adapterType === 'universal' && (
                                <div className="space-y-2 border-t border-white/5 pt-6 animate-in slide-in-from-top duration-500">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                            <Code size={14} />
                                            Universal Mapping Logic (JSON)
                                        </label>
                                    </div>
                                    <textarea 
                                        rows={10}
                                        placeholder='{
  "purchaseUrl": "https://api.vendor.com/buy",
  "balanceUrl": "https://api.vendor.com/wallet",
  "queryUrl": "https://api.vendor.com/status",
  "authHeaderName": "Authorization",
  "authHeaderValue": "Token {{apiKey}}",
  "fieldMap": {
    "phone": "mobile_no",
    "amount": "amount",
    "serviceID": "network_id"
  },
  "successPath": "status_code",
  "successValue": "201"
}'
                                        value={typeof editingProvider?.metadata === 'string' ? editingProvider.metadata : JSON.stringify(editingProvider?.metadata || {}, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setEditingProvider({...editingProvider, metadata: parsed});
                                            } catch (err) {
                                                setEditingProvider({...editingProvider, metadata: e.target.value});
                                            }
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            )}
                        </form>

                        {/* Sticky Footer */}
                        <div className="p-8 pt-4 border-t border-white/5 bg-slate-900 shrink-0 flex items-center gap-4">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-white/5 text-[10px] font-bold text-white uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={(e: any) => handleSave(e)}
                                disabled={isSaving}
                                className="flex-1 px-6 py-4 bg-emerald-500 text-[10px] font-bold text-slate-950 uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                            >
                                {isSaving ? "Synchronizing..." : editingProvider?._id ? "Update Gateway" : "Finish Integration"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProvidersPage;
