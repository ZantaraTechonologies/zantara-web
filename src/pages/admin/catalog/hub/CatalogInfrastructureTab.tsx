import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    RefreshCcw, 
    Search,
    Edit3,
    CheckCircle2,
    XCircle,
    Database,
    Tag,
    Briefcase,
    Activity,
    ChevronRight,
    Save,
    X,
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { toast } from 'react-hot-toast';

type TabType = 'categories' | 'types' | 'brands';

const CatalogInfrastructureTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('categories');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    
    // Dropdowns for linking
    const [categories, setCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        name: '',
        status: true,
        categoryId: '',
        typeIds: [], // Changed from typeId
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    useEffect(() => {
        if (showModal) {
            loadDropdowns();
        }
    }, [showModal, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const endpoint = `/admin/hierarchy/${activeTab}`;
            const res = await apiClient.get(endpoint);
            setData(res.data.data);
        } catch (err) {
            toast.error(`Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const loadDropdowns = async () => {
        try {
            if (activeTab === 'types' || activeTab === 'brands') {
                const res = await apiClient.get('/admin/hierarchy/categories');
                setCategories(res.data.data);
            }
            if (activeTab === 'brands') {
                const res = await apiClient.get('/admin/hierarchy/types');
                setTypes(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load dropdown metadata", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = editingItem 
                ? `/admin/hierarchy/${activeTab}/${editingItem._id}` 
                : `/admin/hierarchy/${activeTab}`;
            
            const method = editingItem ? 'put' : 'post';
            const payload = { ...formData };
            if (activeTab === 'types' && payload.aliases) {
                payload.aliases = payload.aliases.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
            }

            await apiClient[method](endpoint, payload);
            
            toast.success(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`);
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', status: true, categoryId: '', typeIds: [], aliases: '' });
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const toggleStatus = async (item: any) => {
        try {
            const endpoint = `/admin/hierarchy/${activeTab}/${item._id}`;
            await apiClient.put(endpoint, { status: !item.status });
            setData(data.map(i => i._id === item._id ? { ...i, status: !item.status } : i));
            toast.success("Status updated");
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header & Sub-Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex p-1.5 bg-surface border border-slate-200 rounded-3xl">
                    {(['categories', 'types', 'brands'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab 
                                ? 'bg-indigo-500 text-slate-950 shadow-xl shadow-indigo-500/20' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all w-64 font-bold"
                        />
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    </div>
                    <button 
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ name: '', status: true, categoryId: '', typeIds: [], aliases: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-surface text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                    >
                        <Plus size={16} /> New {activeTab.slice(0, -1)}
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Name / Identity</th>
                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Associations</th>
                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                            <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-10 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-[10px]">Fetching {activeTab}...</td></tr>)
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-16 text-center">
                                    <Database size={40} className="text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No master data found</p>
                                </td>
                            </tr>
                        ) : filteredData.map((item) => (
                            <tr key={item._id} className="group hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-500">
                                            {activeTab === 'categories' ? <Database size={16} /> : activeTab === 'types' ? <Tag size={16} /> : <Briefcase size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mt-1">{item.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {activeTab === 'types' && (
                                        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                            {item.categoryId?.name || 'Unlinked'}
                                        </span>
                                    )}
                                    {activeTab === 'brands' && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.typeIds && item.typeIds.length > 0 ? (
                                                item.typeIds.map((t: any) => (
                                                    <span key={t._id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                                        {t.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[9px] font-black text-slate-400">No associations</span>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'categories' && <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Node</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <button 
                                        onClick={() => toggleStatus(item)}
                                        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${item.status ? 'text-emerald-500' : 'text-slate-600'}`}
                                    >
                                        {item.status ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                        {item.status ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => {
                                            setEditingItem(item);
                                            setFormData({
                                                name: item.name,
                                                status: item.status,
                                                categoryId: item.categoryId?._id || item.categoryId || '',
                                                typeIds: item.typeIds?.map((t: any) => t._id || t) || [],
                                                aliases: item.aliases ? item.aliases.join(', ') : '',
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-all hover:bg-indigo-500/20"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Master Data Management</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Display Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                />
                            </div>

                            {activeTab === 'types' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Parent Category</label>
                                        <select 
                                            required
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Aliases (Comma separated)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. airtime, topup, airtime-vtu"
                                            value={formData.aliases || ''}
                                            onChange={(e) => setFormData({...formData, aliases: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                        />
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1 ml-1">These names will also point to this category in the mobile app</p>
                                    </div>
                                </>
                            )}

                            {activeTab === 'brands' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Service Type Associations (Multi-Select)</label>
                                    <select 
                                        required
                                        multiple
                                        value={formData.typeIds}
                                        onChange={(e) => {
                                            const options = e.target.options;
                                            const values = [];
                                            for (let i = 0, l = options.length; i < l; i++) {
                                                if (options[i].selected) {
                                                    values.push(options[i].value);
                                                }
                                            }
                                            setFormData({...formData, typeIds: values});
                                        }}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold min-h-[120px]"
                                    >
                                        {types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1 ml-1">Hold Ctrl/Cmd to select multiple types</p>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, status: !formData.status})}
                                    className={`w-12 h-6 rounded-full relative transition-all ${formData.status ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`dark:border dark:border-slate-500/25 absolute top-1 w-4 h-4 rounded-full bg-surface transition-all ${formData.status ? 'left-7' : 'left-1'}`}></div>
                                </button>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{formData.status ? 'Active' : 'Disabled'}</span>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3 bg-surface text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                            >
                                <Save size={16} className="inline mr-2" /> {editingItem ? 'Save Changes' : `Create ${activeTab.slice(0, -1)}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogInfrastructureTab;
