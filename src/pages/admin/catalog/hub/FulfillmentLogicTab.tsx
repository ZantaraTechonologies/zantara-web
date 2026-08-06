import React, { useState, useEffect } from 'react';
import { 
    RefreshCcw, 
    ShieldCheck, 
    ShieldAlert, 
    Search,
    RefreshCw,
    Network,
    TrendingUp,
    Package,
    Layers,
    ArrowRight,
    ChevronRight,
    Info,
    Inbox,
    PlusCircle,
    Archive,
    XCircle
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { toast } from 'react-hot-toast';
import { useWalletStore } from '../../../../store/wallet/walletStore';
import { ListSkeleton } from '../../../../components/feedback/Skeletons';

const FulfillmentLogicTab: React.FC = () => {
    const [identities, setIdentities] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSearchTerm, setOfferSearchTerm] = useState('');
    const [offerCurrentPage, setOfferCurrentPage] = useState(1);
    const [offersPerPage, setOffersPerPage] = useState(10);
    const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);
    const [variants, setVariants] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [mappingForm, setMappingForm] = useState({
        serviceId: '',
        providerId: '',
        providerCode: '',
        costMode: 'fixed' as 'fixed' | 'dynamic',
        costPrice: 0,
        priority: 0
    });
    const [variantSearch, setVariantSearch] = useState('');
    const [showVariantList, setShowVariantList] = useState(false);
    const { currency } = useWalletStore();

    useEffect(() => {
        loadIdentities();
    }, []);

    useEffect(() => {
        if (selectedIdentity) {
            loadVariants(selectedIdentity._id);
            loadOffers(selectedIdentity._id);
            loadProviders();
        } else {
            setOffers([]);
            setVariants([]);
        }
    }, [selectedIdentity]);

    const loadProviders = async () => {
        try {
            const res = await apiClient.get('/admin/providers');
            setProviders(res.data.data);
        } catch (err) {
            console.error("Failed to load providers");
        }
    };

    const loadVariants = async (identityId: string) => {
        try {
            const res = await apiClient.get(`/admin/services?identityId=${identityId}`);
            setVariants(res.data.data);
        } catch (err) {
            toast.error("Failed to load service variants");
        }
    };

    const loadIdentities = async () => {
        setIdentitiesLoading(true);
        try {
            const res = await apiClient.get('/admin/hierarchy/identities');
            setIdentities(res.data.data);
        } catch (err) {
            toast.error("Failed to load service identities");
        } finally {
            setIdentitiesLoading(false);
        }
    };

    const loadOffers = async (identityId: string) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/admin/hierarchy/provider-offers?identityId=${identityId}`);
            setOffers(res.data.data);
        } catch (err) {
            toast.error("Failed to load provider connections");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOffer = async (id: string, updates: any) => {
        try {
            await apiClient.put(`/admin/hierarchy/provider-offers/${id}`, updates);
            setOffers(offers.map(o => o._id === id ? { ...o, ...updates } : o));
            toast.success("Connection updated");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const handleCreateMapping = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...mappingForm };
        if (payload.costMode === 'dynamic') payload.costPrice = 0;
        try {
            await apiClient.post('/admin/hierarchy/provider-offers', payload);
            toast.success("Route mapping established");
            setShowMappingModal(false);
            setMappingForm({ serviceId: '', providerId: '', providerCode: '', costMode: 'fixed', costPrice: 0, priority: 0 });
            loadOffers(selectedIdentity._id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Mapping failed");
        }
    };

    const handleDeleteOffer = async (id: string) => {
        if (!window.confirm('Delete this fulfillment mapping? This action cannot be undone.')) return;
        try {
            await apiClient.delete(`/admin/hierarchy/provider-offers/${id}`);
            setOffers(offers.filter(o => o._id !== id));
            toast.success('Mapping deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const filteredIdentities = identities.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.brandId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOffers = offers.filter(o => 
        (o.serviceId?.name || '').toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        (o.providerCode || '').toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        (o.providerId?.name || '').toLowerCase().includes(offerSearchTerm.toLowerCase())
    );

    const offerTotalPages = Math.max(1, Math.ceil(filteredOffers.length / offersPerPage));
    const paginatedOffers = filteredOffers.slice(
        (offerCurrentPage - 1) * offersPerPage,
        offerCurrentPage * offersPerPage
    );

    useEffect(() => {
        setOfferCurrentPage(1);
    }, [offerSearchTerm, offersPerPage]);

    return (
        <div className="flex flex-col xl:flex-row gap-10 animate-in fade-in duration-500 pb-20">
            {/* Sidebar: Identity Selector */}
            <div className="w-full xl:w-80 shrink-0 space-y-5">
                <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="text-indigo-500" size={18} />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Service Families</h3>
                    </div>

                    <div className="relative mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Families..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 pl-12 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                        />
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {identitiesLoading ? (
                            Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />)
                        ) : filteredIdentities.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package size={32} className="text-slate-800 mx-auto mb-3" />
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">No identities found</p>
                            </div>
                        ) : filteredIdentities.map((identity) => (
                            <button
                                key={identity._id}
                                onClick={() => setSelectedIdentity(identity)}
                                className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all border ${
                                    selectedIdentity?._id === identity._id 
                                    ? 'bg-surface border-slate-200 text-slate-950 shadow-xl' 
                                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                <div className="text-left">
                                    <p className={`text-[10px] font-black leading-none mb-1 ${selectedIdentity?._id === identity._id ? 'text-slate-950' : 'text-slate-900'}`}>
                                        {identity.name}
                                    </p>
                                    <p className={`text-[8px] font-bold uppercase tracking-tighter ${selectedIdentity?._id === identity._id ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {identity.brandId?.name} • {identity.plansCount} Plans
                                    </p>
                                </div>
                                <ChevronRight size={14} className={selectedIdentity?._id === identity._id ? 'text-slate-950' : 'text-slate-800 group-hover:translate-x-1 transition-transform'} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Info className="text-indigo-600" size={16} />
                        <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Routing Rule</h4>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                        Select an identity to manage its vendor fulfillment paths. <span className="text-indigo-600 font-black underline">Fulfillment ownership</span> is defined per-plan.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                {!selectedIdentity ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface border border-dashed border-slate-200 rounded-2xl">
                        <Inbox size={48} className="text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-2">Select an Identity</h3>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Select a service family to manage provider logic</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedIdentity.name} Fulfillment</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                    Provider mapping and prioritization for {selectedIdentity.name} variants
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search Routes..."
                                        value={offerSearchTerm}
                                        onChange={(e) => setOfferSearchTerm(e.target.value)}
                                        className="bg-surface border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[10px] text-slate-900 focus:outline-none focus:border-indigo-500 font-bold w-48 transition-all focus:w-64"
                                    />
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                                <button 
                                    onClick={() => {
                                        setMappingForm(prev => ({ ...prev, serviceId: variants[0]?._id || '' }));
                                        setShowMappingModal(true);
                                    }}
                                    disabled={variants.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    <PlusCircle size={14} className="not-italic" /> Create Mapping
                                </button>
                                <button 
                                    onClick={() => {
                                        loadOffers(selectedIdentity._id);
                                        loadVariants(selectedIdentity._id);
                                    }}
                                    className="p-3 bg-surface border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-xl"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array(4).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : variants.length === 0 ? (
                            <div className="px-4 py-20 text-center bg-surface border border-slate-200 rounded-2xl">
                                <Archive size={48} className="text-slate-800 mx-auto mb-6" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter">No Variants Created</h3>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                    You must add variants (e.g. 1GB, 2GB) in the <span className="text-indigo-600">Catalog Registry</span> first.
                                </p>
                            </div>
                        ) : offers.length === 0 ? (
                            <div className="px-4 py-20 text-center bg-surface border border-slate-200 rounded-2xl">
                                <Network size={48} className="text-slate-800 mx-auto mb-6" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter">Unmapped Service</h3>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                    No fulfillment routes mapped. Use the <span className="text-indigo-600">Create Mapping</span> button above.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Variant</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Provider</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Provider Code</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Cost Mode</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Cost / Rule</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Priority</th>
                                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                                <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedOffers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-14 text-center">
                                                        <Network size={32} className="text-slate-800 mx-auto mb-4" />
                                                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No matching routes found</p>
                                                    </td>
                                                </tr>
                                            ) : paginatedOffers.map((offer) => (
                                                <tr key={offer._id} className={`group hover:bg-slate-50/60 transition-colors ${!offer.status && 'opacity-50'}`}>
                                                    {/* Variant */}
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{offer.serviceId?.name || 'Unknown Plan'}</p>
                                                        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter mt-0.5">{offer.serviceId?.code}</p>
                                                    </td>
                                                    {/* Provider */}
                                                    <td className="px-4 py-3">
                                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase text-indigo-600 tracking-widest">
                                                            {offer.providerId?.name || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    {/* Provider Code */}
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            defaultValue={offer.providerCode}
                                                            onBlur={(e) => handleUpdateOffer(offer._id, { providerCode: e.target.value })}
                                                            className="text-[10px] font-mono text-slate-500 bg-surface px-2 py-1 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none w-full"
                                                        />
                                                    </td>
                                                    {/* Cost Mode */}
                                                    <td className="px-4 py-3">
                                                        {offer.costMode === 'dynamic' ? (
                                                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest">Dynamic</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">Fixed</span>
                                                        )}
                                                    </td>
                                                    {/* Cost / Rule */}
                                                    <td className="px-4 py-3">
                                                        {offer.costMode === 'dynamic' ? (
                                                            <span className="text-[10px] text-amber-600 font-black">Runtime Derived</span>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-indigo-600">{currency}</span>
                                                                <input
                                                                    type="number"
                                                                    defaultValue={offer.costPrice}
                                                                    onBlur={(e) => handleUpdateOffer(offer._id, { costPrice: Number(e.target.value) })}
                                                                    className="bg-transparent border-none w-16 text-sm text-slate-900 font-black focus:outline-none focus:text-indigo-600 transition-colors"
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Priority */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp size={12} className="text-emerald-500 shrink-0" />
                                                            <input
                                                                type="number"
                                                                defaultValue={offer.priority}
                                                                onBlur={(e) => handleUpdateOffer(offer._id, { priority: Number(e.target.value) })}
                                                                className="bg-transparent border-none w-12 text-sm text-slate-900 font-black focus:outline-none focus:text-emerald-600 transition-colors"
                                                            />
                                                        </div>
                                                    </td>
                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        {offer.status ? (
                                                            <span className="flex items-center gap-1.5 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                                                <ShieldCheck size={12} /> Active
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                                                                <ShieldAlert size={12} /> Disabled
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateOffer(offer._id, { status: !offer.status })}
                                                                title={offer.status ? 'Disable Route' : 'Enable Route'}
                                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                    offer.status
                                                                        ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                                                                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                                }`}
                                                            >
                                                                {offer.status ? 'Disable' : 'Enable'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteOffer(offer._id)}
                                                                title="Delete Mapping"
                                                                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-between bg-slate-50/50 border-t border-slate-100 p-5">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Show</span>
                                            <select 
                                                value={offersPerPage}
                                                onChange={(e) => setOffersPerPage(Number(e.target.value))}
                                                className="bg-surface border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entries</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-200"></div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            Page <span className="text-slate-900">{offerCurrentPage}</span> of <span className="text-slate-900">{offerTotalPages}</span>
                                            <span className="mx-4 text-slate-800">•</span>
                                            Showing <span className="text-indigo-600">{paginatedOffers.length}</span> of <span className="text-slate-900">{filteredOffers.length}</span> Results
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            disabled={offerCurrentPage === 1}
                                            onClick={() => setOfferCurrentPage(prev => prev - 1)}
                                            className="px-6 py-3 bg-surface border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(offerTotalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setOfferCurrentPage(i + 1)}
                                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${offerCurrentPage === i + 1 ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            disabled={offerCurrentPage === offerTotalPages}
                                            onClick={() => setOfferCurrentPage(prev => prev + 1)}
                                            className="px-6 py-3 bg-surface border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mapping Modal */}
            {showMappingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-xl max-h-[90vh] bg-surface border border-slate-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Establish Route Mapping</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Link a variant to a provider API code</p>
                            </div>
                            <button onClick={() => setShowMappingModal(false)} className="text-slate-500 hover:text-slate-900"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateMapping} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Select Variant</label>
                                <div className="relative">
                                    <div 
                                        onClick={() => setShowVariantList(!showVariantList)}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-bold cursor-pointer flex justify-between items-center"
                                    >
                                        <span>{mappingForm.serviceId ? variants.find(v => v._id === mappingForm.serviceId)?.name : 'Select Variant...'}</span>
                                        <ChevronRight size={16} className={`transition-transform ${showVariantList ? 'rotate-90' : ''}`} />
                                    </div>
                                    
                                    {showVariantList && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                                <div className="relative">
                                                    <input 
                                                        autoFocus
                                                        type="text" 
                                                        placeholder="Search variants..."
                                                        value={variantSearch}
                                                        onChange={(e) => setVariantSearch(e.target.value)}
                                                        className="w-full bg-surface border border-slate-200 rounded-xl p-3 pl-10 text-[11px] text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                                </div>
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {variants.filter(v => 
                                                    v.name.toLowerCase().includes(variantSearch.toLowerCase()) || 
                                                    v.code.toLowerCase().includes(variantSearch.toLowerCase())
                                                ).map((v: any) => (
                                                    <button
                                                        key={v._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setMappingForm({...mappingForm, serviceId: v._id});
                                                            setShowVariantList(false);
                                                            setVariantSearch('');
                                                        }}
                                                        className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                                    >
                                                        <p className="text-[11px] font-black text-slate-900 leading-tight">{v.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{v.code}</p>
                                                    </button>
                                                ))}
                                                {variants.length === 0 && (
                                                    <div className="p-8 text-center">
                                                        <p className="text-[10px] font-black text-slate-600 uppercase">No variants found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Provider Gateway</label>
                                    <select 
                                        required
                                        value={mappingForm.providerId}
                                        onChange={(e) => setMappingForm({...mappingForm, providerId: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                    >
                                        <option value="">Select Gateway...</option>
                                        {providers.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cost Mode</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMappingForm({...mappingForm, costMode: 'fixed'})}
                                            className={`p-4 rounded-2xl border text-left transition-all ${mappingForm.costMode === 'fixed' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600' : 'bg-surface border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-widest">Fixed Cost</p>
                                            <p className="text-[9px] text-slate-600 mt-1 font-medium">Set a fixed provider cost per transaction</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMappingForm({...mappingForm, costMode: 'dynamic'})}
                                            className={`p-4 rounded-2xl border text-left transition-all ${mappingForm.costMode === 'dynamic' ? 'bg-amber-500/10 border-amber-500/40 text-amber-600' : 'bg-surface border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-widest">Dynamic Cost</p>
                                            <p className="text-[9px] text-slate-600 mt-1 font-medium">Cost derived at runtime (Airtime, Electricity)</p>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Provider SKU Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., mtn-100mb"
                                        value={mappingForm.providerCode}
                                        onChange={(e) => setMappingForm({...mappingForm, providerCode: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                {mappingForm.costMode === 'fixed' ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cost Price ({currency})</label>
                                        <input 
                                            required
                                            type="number" 
                                            value={mappingForm.costPrice}
                                            onChange={(e) => setMappingForm({...mappingForm, costPrice: Number(e.target.value)})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cost / Rule</label>
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Runtime Derived</p>
                                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                                No fixed cost required. The provider's actual charge will be captured at the moment of transaction execution. Used for Airtime, Electricity, and variable-amount services.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Routing Priority</label>
                                    <input 
                                        required
                                        type="number" 
                                        value={mappingForm.priority}
                                        onChange={(e) => setMappingForm({...mappingForm, priority: Number(e.target.value)})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3 bg-indigo-500 text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                            >
                                Confirm Route Mapping
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FulfillmentLogicTab;
