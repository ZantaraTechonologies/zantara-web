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
    Cpu,
    Search,
    Code
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { CardSkeleton } from '../../../../components/feedback/Skeletons';
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

const VendorGatewaysTab: React.FC = () => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">API Supply Infrastructure</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Configure & Monitor External API Gates</p>
                </div>

                <button 
                    onClick={() => { setEditingProvider({}); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={16} />
                    Integrate New Provider
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {providers.map((provider) => (
                    <div key={provider._id} className="group relative bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 rounded-[2.5rem] p-8 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter">{provider.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            provider.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                            provider.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            <Activity size={10} />
                                            {provider.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => { setEditingProvider(provider); setIsModalOpen(true); }}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(provider._id)}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">Vendor Liquidity</span>
                                    <Wallet size={12} className="text-emerald-500" />
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-2xl font-black text-white tracking-tighter italic">₦{provider.balance?.toLocaleString() || '0'}</h4>
                                    <button 
                                        onClick={() => handleCheckBalance(provider._id)}
                                        className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-slate-500 hover:text-emerald-500 transition-all"
                                    >
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">API Endpoint</span>
                                    <Globe size={12} className="text-blue-500" />
                                </div>
                                <p className="text-[10px] font-mono text-slate-500 truncate mt-1">{provider.baseUrl}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Logic (Condensed for Hub use) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-white/5">
                            <h2 className="text-2xl font-black text-white tracking-tighter italic">{editingProvider?._id ? 'Update Gateway' : 'New API Connection' }</h2>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gateway Name</label>
                                    <input 
                                        type="text" required
                                        value={editingProvider?.name || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base URL</label>
                                    <input 
                                        type="url" required
                                        value={editingProvider?.baseUrl || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, baseUrl: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key / Username</label>
                                    <input 
                                        type="text" required
                                        value={editingProvider?.apiKey || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, apiKey: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public Key (VTPass Sandbox)</label>
                                    <input 
                                        type="text"
                                        value={editingProvider?.publicKey || ''}
                                        onChange={(e) => setEditingProvider({...editingProvider, publicKey: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key / Password</label>
                                <input 
                                    type="password"
                                    value={editingProvider?.secretKey || ''}
                                    onChange={(e) => setEditingProvider({...editingProvider, secretKey: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adapter</label>
                                    <select 
                                        value={editingProvider?.adapterType || 'vtpass'}
                                        onChange={(e: any) => setEditingProvider({...editingProvider, adapterType: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="vtpass">VTPass (Official)</option>
                                        <option value="vas2nets">Vas2Nets (Legacy)</option>
                                        <option value="universal">Universal Gateway</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                                    <select 
                                        value={editingProvider?.status || 'active'}
                                        onChange={(e: any) => setEditingProvider({...editingProvider, status: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="inactive">Disabled</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="p-10 pt-4 flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-4 bg-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-emerald-500/20">{isSaving ? 'Syncing...' : 'Deploy Gateway'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorGatewaysTab;
