import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    RefreshCcw, 
    Search,
    Network,
    Info,
    LayoutGrid,
    ArrowLeft,
    Layers,
    Activity,
    ShieldCheck,
    MoreVertical,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Package,
    PlusCircle,
    Archive,
    TrendingUp
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { ListSkeleton } from '../../../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';
import CatalogMaintenanceTools from './CatalogMaintenanceTools';

interface Identity {
    _id: string;
    name: string;
    internalCode: string;
    categoryId?: { _id: string; name: string };
    typeId?: { _id: string; name: string };
    brandId?: { _id: string; name: string };
    providerCode?: string;
    plansCount: number;
    offersCount: number;
    hasPricing: boolean;
    status: boolean;
    fulfillmentMode: string;
    readiness: {
        hasVariants: boolean;
        hasFulfillment: boolean;
        hasPricing: boolean;
        isVisible: boolean;
    };
}

interface Plan {
    _id: string;
    name: string;
    code: string;
    status: boolean;
    price: number;
}

const CatalogRegistryTab: React.FC = () => {
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [variantSearchTerm, setVariantSearchTerm] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [metadata, setMetadata] = useState<any>({ categories: [], types: [], brands: [] });
    const [formData, setFormData] = useState({
        name: '',
        internalCode: '',
        categoryId: '',
        typeId: '',
        brandId: '',
        providerCode: '',
        fulfillmentMode: 'sync'
    });

    const [editData, setEditData] = useState<any>(null);

    const [showVariantModal, setShowVariantModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Plan | null>(null);
    const [variantFormData, setVariantFormData] = useState({
        name: '',
        code: '',
        status: true
    });

    useEffect(() => {
        loadIdentities();
        loadMetadata();
    }, []);

    const loadIdentities = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/hierarchy/identities');
            setIdentities(res.data.data);
        } catch (err) {
            toast.error("Failed to load catalog registry");
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const res = await apiClient.get('/admin/hierarchy/metadata');
            setMetadata({ ...res.data.data, brands: [] }); // Start with empty brands
        } catch (err) {
            console.error("Metadata load failed", err);
        }
    };

    const loadBrands = async (typeId: string) => {
        if (!typeId) {
            setMetadata((prev: any) => ({ ...prev, brands: [] }));
            return;
        }
        try {
            const res = await apiClient.get(`/admin/hierarchy/metadata?typeId=${typeId}`);
            setMetadata((prev: any) => ({ ...prev, brands: res.data.data.brands }));
        } catch (err) {
            console.error("Brand metadata load failed", err);
        }
    };

    useEffect(() => {
        if (formData.typeId) {
            loadBrands(formData.typeId);
            setFormData(prev => ({ ...prev, brandId: '' })); // Reset brand if type changes
        }
    }, [formData.typeId]);

    const loadPlans = async (identityId: string) => {
        setPlansLoading(true);
        try {
            const res = await apiClient.get(`/admin/services?identityId=${identityId}`);
            setPlans(res.data.data);
        } catch (err) {
            toast.error("Failed to load plan variants");
        } finally {
            setPlansLoading(false);
        }
    };

    const handleCreateIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await apiClient.post('/admin/hierarchy/identities', formData);
            toast.success("Service Identity registered successfully");
            setShowCreateModal(false);
            setFormData({ name: '', internalCode: '', categoryId: '', typeId: '', brandId: '', fulfillmentMode: 'sync' });
            loadIdentities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        setIsProcessing(true);
        try {
            await apiClient.put(`/admin/hierarchy/identities/${editData._id}`, editData);
            toast.success("Identity updated");
            setShowEditModal(false);
            setSelectedIdentity(null); // Return to list to refresh
            loadIdentities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveVariant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIdentity) return;

        setIsProcessing(true);
        try {
            if (editingVariant) {
                // Update Existing
                await apiClient.put(`/admin/services/${editingVariant._id}`, variantFormData);
                toast.success("Variant updated");
            } else {
                // Create New
                const payload = {
                    ...variantFormData,
                    identityId: selectedIdentity._id,
                    categoryId: selectedIdentity.categoryId?._id,
                    typeId: selectedIdentity.typeId?._id,
                    brandId: selectedIdentity.brandId?._id,
                    category: selectedIdentity.typeId?.name.toLowerCase().includes('data') ? 'data' : 
                              selectedIdentity.typeId?.name.toLowerCase().includes('airtime') ? 'airtime' :
                              selectedIdentity.typeId?.name.toLowerCase().includes('tv') ? 'tv' :
                              selectedIdentity.typeId?.name.toLowerCase().includes('electricity') ? 'electricity' : 'pin'
                };
                await apiClient.post('/admin/services', payload);
                toast.success("Variant added to identity");
            }
            
            setShowVariantModal(false);
            setEditingVariant(null);
            setVariantFormData({ name: '', code: '', status: true });
            loadPlans(selectedIdentity._id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePurgeData = async () => {
        if (!window.confirm("CRITICAL ACTION: This will delete all current noisy imported plans that aren't linked to a manual identity. Proceed?")) return;
        
        setIsProcessing(true);
        try {
            const res = await apiClient.post('/admin/hierarchy/purge-noisy-data');
            toast.success(res.data.message);
            loadIdentities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Purge failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredIdentities = identities.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.brandId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredIdentities.length / itemsPerPage));
    const paginatedIdentities = filteredIdentities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching or changing page size
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    if (loading) return <ListSkeleton count={5} />;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {selectedIdentity ? (
                /* Drill-down View */
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setSelectedIdentity(null)}
                                className="p-4 bg-slate-900 border border-white/5 rounded-3xl text-slate-400 hover:text-white transition-all shadow-xl"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-3xl font-black text-white tracking-tighter italic">{selectedIdentity.name}</h2>
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Identity</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                    {selectedIdentity.brandId?.name} • {selectedIdentity.typeId?.name} • {selectedIdentity.internalCode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    setEditData({ ...selectedIdentity });
                                    setShowEditModal(true);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5 transition-all"
                            >
                                <Edit3 size={14} /> Edit Identity
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Plan Variants (SKUs)</h3>
                                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-0.5 italic">Specific product definitions under this identity</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Search variants..."
                                            value={variantSearchTerm}
                                            onChange={(e) => setVariantSearchTerm(e.target.value)}
                                            className="bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[10px] text-white focus:outline-none focus:border-indigo-500/50 transition-all w-56 font-bold"
                                        />
                                        <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    </div>
                                    <button 
                                        onClick={() => setShowVariantModal(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform"
                                    >
                                        <PlusCircle size={14} /> Add Variant
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-950/30">
                                            <th className="text-left py-6 px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Variant Name</th>
                                            <th className="text-left py-6 px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">SKU Code</th>
                                            <th className="text-left py-6 px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Routes</th>
                                            <th className="text-left py-6 px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Status</th>
                                            <th className="text-right py-6 px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {plansLoading ? (
                                            Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="py-12 text-center text-slate-700 animate-pulse font-black uppercase tracking-widest text-[10px]">Updating Registry...</td></tr>)
                                        ) : plans.filter(p => 
                                            p.name.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                                            p.code.toLowerCase().includes(variantSearchTerm.toLowerCase())
                                        ).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-24 text-center">
                                                    <Archive size={40} className="text-slate-800 mx-auto mb-4" />
                                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">No variants found matching your search</p>
                                                </td>
                                            </tr>
                                        ) : plans.filter(p => 
                                            p.name.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                                            p.code.toLowerCase().includes(variantSearchTerm.toLowerCase())
                                        ).map((plan) => (
                                            <tr key={plan._id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-6 px-8">
                                                    <p className="text-sm font-black text-white tracking-tight italic">{plan.name}</p>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <code className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-tighter">{plan.code}</code>
                                                </td>
                                                <td className="py-6 px-8 text-[10px] font-black text-indigo-400 italic">2 Paths</td>
                                                <td className="py-6 px-8">
                                                    <div className={`w-2 h-2 rounded-full ${plan.status ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingVariant(plan);
                                                                setVariantFormData({ name: plan.name, code: plan.code, status: plan.status });
                                                                setShowVariantModal(true);
                                                            }}
                                                            className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all hover:bg-indigo-500/20"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if (window.confirm("Delete this variant?")) {
                                                                    await apiClient.delete(`/admin/services/${plan._id}`);
                                                                    loadPlans(selectedIdentity._id);
                                                                    toast.success("Variant deleted");
                                                                }
                                                            }}
                                                            className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-rose-500 transition-all hover:bg-rose-500/10"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="text-emerald-500" size={18} />
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Pricing Logic Insight</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">Base Provider Cost</span>
                                        <span className="text-indigo-400">Managed in Fulfillment</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">Markup Rule</span>
                                        <span className="text-emerald-400">Managed in Pricing</span>
                                    </div>
                                    <div className="h-px bg-white/5"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Result</span>
                                        <span className="text-lg font-black text-white tracking-tighter italic">Dynamic Selling Price</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[2.5rem]">
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter italic">
                                    <span className="text-indigo-400 font-black">Architecture Note:</span> This sub-view defines the identity of plans. Physical vendor logic and pricing strategy ownership remain decoupled for operational safety.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Registry List View */
                <div className="space-y-10 animate-in fade-in duration-500">
                    {/* Legend & Stats */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-indigo-500/5 border border-indigo-500/10 p-10 rounded-[3rem] flex items-start gap-8 relative overflow-hidden group">
                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                                <Layers size={32} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">Service Registry Hub</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-tighter max-w-xl">
                                    This is the <span className="text-indigo-400 font-black italic underline decoration-indigo-400/30">Manual Business Definition Layer</span>. Define high-level services like <span className="text-white font-black italic">"MTN Data"</span> or <span className="text-white font-black italic">"DStv"</span>.
                                    Plan variants and fulfillment routes are managed in nested views.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Registry</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white tracking-tighter italic leading-none">{identities.length}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">Defined Service Families</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-4 bg-slate-900/30 p-2 rounded-3xl border border-white/5">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search Registry..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none pl-12 pr-6 py-3 text-xs text-white focus:outline-none w-64 font-bold"
                                />
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            </div>
                            <button 
                                onClick={loadIdentities}
                                className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-indigo-500/10"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handlePurgeData}
                                className="flex items-center gap-2 px-6 py-4 bg-rose-500/10 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/0 hover:shadow-rose-500/20"
                            >
                                <Trash2 size={16} /> Purge Noisy Data
                            </button>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.1em] shadow-2xl hover:scale-105 transition-transform active:scale-95"
                            >
                                <PlusCircle size={18} /> Register New Service
                            </button>
                        </div>
                    </div>

                    {/* Registry Table */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/50">
                                        <th className="text-left py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Business Family</th>
                                        <th className="text-left py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Brand</th>
                                        <th className="text-left py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Protocol Type</th>
                                        <th className="text-left py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Readiness</th>
                                        <th className="text-left py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Status</th>
                                        <th className="text-right py-8 px-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedIdentities.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-32 text-center">
                                                <Package size={48} className="text-slate-800 mx-auto mb-6" />
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No matching entries found</p>
                                            </td>
                                        </tr>
                                    ) : paginatedIdentities.map((identity) => (
                                        <tr key={identity._id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <Network size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white tracking-tight italic leading-tight">{identity.name}</p>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic leading-none">{identity.internalCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{identity.brandId?.name || 'GENERIC'}</p>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className="px-3 py-1 rounded-lg bg-slate-950 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest inline-block italic">
                                                    {identity.typeId?.name || 'UNDEFINED'}
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-3">
                                                    {[
                                                        { key: 'Variants', val: identity.readiness.hasVariants, tip: "Add at least one product variant (SKU)" },
                                                        { key: 'Fulfillment', val: identity.readiness.hasFulfillment, tip: "Map variants to vendor SKU codes" },
                                                        { key: 'Pricing', val: identity.readiness.hasPricing, tip: "Configure a pricing rule for this service" }
                                                    ].map(step => (
                                                        <div key={step.key} title={!step.val ? step.tip : ""} className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter italic ${step.val ? 'text-emerald-500' : 'text-rose-500/50'}`}>
                                                            {step.val ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                                            {step.key}
                                                        </div>
                                                    ))}
                                                    <div className="h-4 w-px bg-white/10 mx-1"></div>
                                                    <div className={`px-2 py-0.5 rounded flex items-center gap-1 text-[8px] font-black uppercase italic ${identity.readiness.isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                                                        {identity.readiness.isVisible ? <ShieldCheck size={10} /> : <XCircle size={10} />}
                                                        {identity.readiness.isVisible ? 'Live' : 'Hidden'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${identity.status ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                    {identity.status ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {identity.status ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="py-8 px-10 text-right">
                                                <div className="flex items-center justify-end gap-3 transition-opacity">
                                                    {identity.plansCount === 0 ? (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedIdentity(identity);
                                                                loadPlans(identity._id);
                                                                setShowVariantModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <Plus size={12} /> Add Variant
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedIdentity(identity);
                                                                loadPlans(identity._id);
                                                            }}
                                                            className="px-4 py-2 bg-indigo-500 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
                                                        >
                                                            <LayoutGrid size={12} /> Manage Variants
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setEditData({ ...identity });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2.5 rounded-xl bg-white/5 text-slate-600 hover:text-white border border-white/5 transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between bg-slate-900/50 border border-white/5 p-6 rounded-[2rem]">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Show</span>
                                <select 
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Entries</span>
                            </div>
                            <div className="h-4 w-px bg-white/5"></div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                                <span className="mx-4 text-slate-800">•</span>
                                Showing <span className="text-indigo-400">{paginatedIdentities.length}</span> of <span className="text-white">{filteredIdentities.length}</span> Results
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Registration Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter italic">Register New Service Identity</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Define the business-level service family</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateIdentity} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Service Family Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., MTN Mobile Data"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Internal Business Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., MTN_DATA_FAMILY"
                                        value={formData.internalCode}
                                        onChange={(e) => setFormData({...formData, internalCode: e.target.value.toUpperCase()})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Provider Service ID (e.g. mtn-data)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., mtn-data"
                                        value={formData.providerCode}
                                        onChange={(e) => setFormData({...formData, providerCode: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Category</label>
                                    <select 
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {metadata.categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Service Type</label>
                                    <select 
                                        required
                                        value={formData.typeId}
                                        onChange={(e) => setFormData({...formData, typeId: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {metadata.types.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Brand Provider</label>
                                    <select 
                                        required
                                        disabled={!formData.typeId}
                                        value={formData.brandId}
                                        onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                                        className={`w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold appearance-none transition-opacity ${!formData.typeId ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                                    >
                                        <option value="">{formData.typeId ? (metadata.brands.length > 0 ? "Select Brand..." : "No brands found for this type") : "Select service type first"}</option>
                                        {metadata.brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing ? "Finalizing Entry..." : "Confirm & Register Identity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Variant Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter italic">{editingVariant ? 'Edit Variant' : 'Add Product Variant'}</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">{editingVariant ? 'Update' : 'Define'} a specific plan under {selectedIdentity?.name}</p>
                            </div>
                            <button onClick={() => { setShowVariantModal(false); setEditingVariant(null); }} className="text-slate-500 hover:text-white"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveVariant} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Variant Display Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., 1GB SME (30 Days)"
                                        value={variantFormData.name}
                                        onChange={(e) => setVariantFormData({...variantFormData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Internal SKU Code (Universal)</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., MTN_1GB_SME"
                                        value={variantFormData.code}
                                        onChange={(e) => setVariantFormData({...variantFormData, code: e.target.value.toUpperCase()})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setVariantFormData({...variantFormData, status: !variantFormData.status})}
                                    className={`w-12 h-6 rounded-full relative transition-all ${variantFormData.status ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${variantFormData.status ? 'left-7' : 'left-1'}`}></div>
                                </button>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{variantFormData.status ? 'Active' : 'Disabled'}</span>
                            </div>

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-5 bg-indigo-500 text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing ? (editingVariant ? "Updating..." : "Adding to Registry...") : (editingVariant ? "Save Changes" : "Save Variant")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Identity Modal */}
            {showEditModal && editData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter italic">Edit Service Identity</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Modify business-level definitions</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleUpdateIdentity} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Service Family Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Internal Business Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={editData.internalCode}
                                        onChange={(e) => setEditData({...editData, internalCode: e.target.value.toUpperCase()})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 italic">Provider Service ID (e.g. mtn-data)</label>
                                    <input 
                                        type="text" 
                                        value={editData.providerCode || ''}
                                        placeholder="e.g., mtn-data"
                                        onChange={(e) => setEditData({...editData, providerCode: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-5 bg-indigo-500 text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing ? "Saving Changes..." : "Update Identity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogRegistryTab;
