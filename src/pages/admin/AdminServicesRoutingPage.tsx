import React, { useState, useEffect } from 'react';
import { 
    Zap, 
    Network, 
    RefreshCcw, 
    ChevronDown, 
    Cpu, 
    ShieldCheck, 
    TrendingUp, 
    Save,
    Search,
    Filter,
    ArrowUpRight,
    Tag,
    Edit3
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import { CardSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';
import { useWalletStore } from '../../store/wallet/walletStore';

interface Service {
    _id: string;
    name: string;
    code: string;
    providerCode: string;
    category: string;
    price: number;
    costPrice: number;
    provider: string;
    status: boolean;
}

const AdminServicesRoutingPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { currency } = useWalletStore();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/services');
            setServices(res.data.data);
        } catch (err) {
            toast.error("Failed to load service registry");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateService = async (id: string, updates: Partial<Service>) => {
        setSavingId(id);
        try {
            await apiClient.put(`/admin/services/${id}`, updates);
            toast.success("Routing parameters updated");
            setServices(services.map(s => s._id === id ? { ...s, ...updates } : s));
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleSyncCosts = async () => {
        setLoading(true);
        try {
            const providerName = 'VTPass'; // This could be made dynamic
            // List of service IDs to sync (MTN Data, Dstv, etc.)
            const serviceIDs = [
                'mtn-data', 'airtel-data', 'glo-data', 'etisalat-data', 
                'dstv', 'gotv', 'startimes', 'showmax',
                'waec', 'waec-registration', 'jamb'
            ];

            const res = await apiClient.post('/admin/services/sync-costs', {
                providerName,
                serviceIDs
            });

            if (res.data.success) {
                toast.success(`Successfully synced ${res.data.updated} services from ${providerName}`);
                await loadServices(); // Reload data to show new costs
            } else {
                toast.error(res.data.message || "Sync failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Sync request failed");
        } finally {
            setLoading(false);
        }
    };

    const handleImportServices = async () => {
        setLoading(true);
        try {
            const providerName = 'VTPass';
            
            // Map our UI tabs to vendor category identifiers
            let categoryIdentifier = '';
            if (categoryFilter === 'data') categoryIdentifier = 'data';
            else if (categoryFilter === 'airtime') categoryIdentifier = 'airtime';
            else if (categoryFilter === 'tv') categoryIdentifier = 'tv-subscription';
            else if (categoryFilter === 'pin') categoryIdentifier = 'education';
            else if (categoryFilter === 'electricity') categoryIdentifier = 'electricity-bill';

            if (!categoryIdentifier && categoryFilter !== 'all') {
                toast.error("Please select a specific category to import");
                setLoading(false);
                return;
            }

            const payload: any = { providerName };
            if (categoryIdentifier) {
                payload.categoryIdentifier = categoryIdentifier;
            } else {
                // For 'all', we trigger multiple specific ones in the backend (or just one big list)
                payload.serviceIDs = [
                    'mtn-data', 'airtel-data', 'glo-data', 'glo-sme-data', 'etisalat-data',
                    'dstv', 'gotv', 'startimes', 'showmax',
                    'waec', 'waec-registration', 'jamb'
                ];
            }

            const res = await apiClient.post('/admin/services/import', payload);

            if (res.data.success) {
                toast.success(`Import complete! Found ${res.data.newlyCreated} new providers/plans. Skipped ${res.data.skipped} existing.`);
                await loadServices();
            } else {
                toast.error(res.data.message || "Import failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Import request failed");
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Service Routing & Pricing</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Map Internal Codes to Vendor Gateways</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadServices}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                        <RefreshCcw size={18} />
                    </button>
                    <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                    <button 
                        onClick={handleSyncCosts}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-500/5 group"
                    >
                        <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        Sync Costs
                    </button>
                    <button 
                        onClick={handleImportServices}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                        <ArrowUpRight size={14} />
                        Auto-Import
                    </button>
                    <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by code or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all w-64"
                        />
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Category Toggles */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'airtime', 'data', 'tv', 'electricity', 'pin'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                            categoryFilter === cat 
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Services Table */}
            <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Identity</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider Logic</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Cost Price</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Selling Price</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Margin</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredServices.map((service) => {
                                const margin = service.price - service.costPrice;
                                const marginPercent = service.costPrice > 0 ? (margin / service.costPrice) * 100 : 0;

                                return (
                                    <tr key={service._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                                    <Zap size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{service.name}</p>
                                                    <code className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{service.code}</code>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-12">Vendor</span>
                                                    <input 
                                                        type="text" 
                                                        defaultValue={service.provider}
                                                        onBlur={(e) => handleUpdateService(service._id, { provider: e.target.value })}
                                                        className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 w-32 font-bold"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-12">V-Code</span>
                                                    <input 
                                                        type="text" 
                                                        defaultValue={service.providerCode}
                                                        onBlur={(e) => handleUpdateService(service._id, { providerCode: e.target.value })}
                                                        className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-emerald-500/50 w-32 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5 text-slate-100 font-black tracking-tighter">
                                                    <span className="text-xs">{currency}</span>
                                                    <input 
                                                        type="number"
                                                        defaultValue={service.costPrice}
                                                        onBlur={(e) => handleUpdateService(service._id, { costPrice: Number(e.target.value) })}
                                                        className="bg-transparent border-none w-16 text-center focus:outline-none focus:text-emerald-500 transition-colors"
                                                    />
                                                </div>
                                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Base Cost</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="relative inline-block">
                                                <div className="flex items-center gap-1.5 text-emerald-500 font-black tracking-tighter text-lg">
                                                    <span className="text-xs">{currency}</span>
                                                    <input 
                                                        type="number"
                                                        defaultValue={service.price}
                                                        onBlur={(e) => handleUpdateService(service._id, { price: Number(e.target.value) })}
                                                        className="bg-transparent border-none w-20 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                                                    />
                                                </div>
                                                <div className="absolute -top-3 -right-2 p-1 rounded-full bg-emerald-500/10 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit3 size={10} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className={`inline-flex flex-col items-center px-4 py-2 rounded-2xl border ${
                                                margin > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}>
                                                <span className="text-sm font-black tracking-tighter">+{currency}{margin.toFixed(2)}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-tighter">{marginPercent.toFixed(1)}% ROI</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                disabled={savingId === service._id}
                                                className={`p-3 rounded-2xl transition-all ${
                                                    service.status ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-white/5 text-slate-500 hover:text-white'
                                                }`}
                                                onClick={() => handleUpdateService(service._id, { status: !service.status })}
                                            >
                                                {savingId === service._id ? (
                                                    <RefreshCcw size={18} className="animate-spin" />
                                                ) : (
                                                    <ShieldCheck size={18} className={service.status ? 'opacity-100' : 'opacity-30'} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminServicesRoutingPage;
