import React, { useState, useEffect } from 'react';
import { 
    Tags, 
    Plus, 
    Trash2, 
    Save, 
    ShieldCheck, 
    ShieldAlert, 
    Edit3,
    CheckCircle2,
    XCircle,
    Info,
    RefreshCw
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { toast } from 'react-hot-toast';
import { useWalletStore } from '../../../../store/wallet/walletStore';

const PricingStrategyTab: React.FC = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newRule, setNewRule] = useState({
        targetType: 'global',
        targetId: '',
        userRole: 'all',
        markupType: 'percent',
        markupValue: 0,
        priority: 0,
        status: true
    });
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);
    const [metadata, setMetadata] = useState<any>({ categories: [], types: [], identities: [], services: [] });
    const { currency } = useWalletStore();

    useEffect(() => {
        loadRules();
        loadMetadata();
    }, []);

    const loadMetadata = async () => {
        try {
            const [catRes, typeRes, identRes, servRes] = await Promise.all([
                apiClient.get('/admin/hierarchy/categories'),
                apiClient.get('/admin/hierarchy/types'),
                apiClient.get('/admin/hierarchy/identities'),
                apiClient.get('/admin/services')
            ]);
            setMetadata({
                categories: catRes.data.data,
                types: typeRes.data.data,
                identities: identRes.data.data,
                services: servRes.data.data
            });
        } catch (err) {
            console.error("Failed to load pricing metadata");
        }
    };

    const loadRules = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/hierarchy/pricing-rules');
            setRules(res.data.data);
        } catch (err) {
            toast.error("Failed to load pricing rules");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRule = async () => {
        try {
            const payload = { ...newRule };
            if (payload.targetType === 'global') {
                payload.targetId = undefined as any; // Omit
            }

            const res = await apiClient.post('/admin/hierarchy/pricing-rules', payload);
            setRules([res.data.data, ...rules]);
            setIsAdding(false);
            setNewRule({
                targetType: 'global',
                targetId: '',
                userRole: 'all',
                markupType: 'percent',
                markupValue: 0,
                priority: 0,
                status: true
            });
            toast.success("Pricing rule created");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Creation failed");
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) return;
        try {
            await apiClient.delete(`/admin/hierarchy/pricing-rules/${id}`);
            setRules(rules.filter(r => r._id !== id));
            toast.success("Rule deleted");
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleUpdateStatus = async (id: string, status: boolean) => {
        try {
            await apiClient.put(`/admin/hierarchy/pricing-rules/${id}`, { status });
            setRules(rules.map(r => r._id === id ? { ...r, status } : r));
            toast.success(`Rule ${status ? 'activated' : 'deactivated'}`);
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleStartEdit = (rule: any) => {
        setEditingRuleId(rule._id);
        setEditForm({ ...rule });
    };

    const handleUpdateRule = async () => {
        try {
            const res = await apiClient.put(`/admin/hierarchy/pricing-rules/${editingRuleId}`, editForm);
            setRules(rules.map(r => r._id === editingRuleId ? res.data.data : r));
            setEditingRuleId(null);
            setEditForm(null);
            toast.success("Pricing rule updated");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const getTargetName = (rule: any) => {
        if (rule.targetType === 'global') return 'Global Catalog';
        
        const id = rule.targetId;
        if (!id) return 'Unknown Target';

        switch (rule.targetType) {
            case 'category':
                return metadata.categories.find((c: any) => c._id === id)?.name || id;
            case 'service_type':
                return metadata.types.find((t: any) => t._id === id)?.name || id;
            case 'identity':
                return metadata.identities.find((i: any) => i._id === id)?.name || id;
            case 'service':
                return metadata.services.find((s: any) => s._id === id)?.name || id;
            default:
                return 'Specific Scope';
        }
    };

    if (loading) return <div className="h-[40vh] flex items-center justify-center"><RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Strategic Markup Engines</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Configure global and granular profit layers</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                >
                    {isAdding ? <XCircle size={14} /> : <Plus size={14} />}
                    {isAdding ? 'Cancel' : 'Add Strategic Rule'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Scope</label>
                            <select 
                                value={newRule.targetType}
                                onChange={(e) => setNewRule({...newRule, targetType: e.target.value, targetId: ''})}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="global">Global (All Services)</option>
                                <option value="category">Category</option>
                                <option value="service_type">Service Type</option>
                                <option value="identity">Service Identity</option>
                                <option value="service">Variant (SKU)</option>
                            </select>
                        </div>
                        {newRule.targetType !== 'global' && (
                            <div className="space-y-2 animate-in slide-in-from-left duration-300">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Select Target</label>
                                <select 
                                    value={newRule.targetId}
                                    onChange={(e) => setNewRule({...newRule, targetId: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select Target...</option>
                                    {newRule.targetType === 'category' && metadata.categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    {newRule.targetType === 'service_type' && metadata.types.map((t: any) => <option key={t._id} value={t._id}>{t.name} ({t.categoryId?.name})</option>)}
                                    {newRule.targetType === 'identity' && metadata.identities.map((i: any) => <option key={i._id} value={i._id}>{i.name} ({i.brandId?.name})</option>)}
                                    {newRule.targetType === 'service' && metadata.services.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Logic</label>
                            <select 
                                value={newRule.markupType}
                                onChange={(e: any) => setNewRule({...newRule, markupType: e.target.value})}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="percent">Percent (%)</option>
                                <option value="fixed">Fixed (₦)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Value</label>
                            <input 
                                type="number"
                                value={newRule.markupValue}
                                onChange={(e) => setNewRule({...newRule, markupValue: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleCreateRule} className="px-10 py-4 bg-indigo-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20">Deploy Engine</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {rules.map((rule) => (
                    <div key={rule._id} className={`bg-slate-900/50 border rounded-[2.5rem] p-8 transition-all ${rule.status ? 'border-white/5' : 'border-rose-500/10 opacity-60'}`}>
                        {editingRuleId === rule._id ? (
                            <div className="space-y-6 animate-in fade-in duration-300 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Logic</label>
                                        <select 
                                            value={editForm.markupType} 
                                            onChange={(e) => setEditForm({...editForm, markupType: e.target.value})} 
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="percent">Percent (%)</option>
                                            <option value="fixed">Fixed (₦)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Value</label>
                                        <input 
                                            type="number" 
                                            value={editForm.markupValue} 
                                            onChange={(e) => setEditForm({...editForm, markupValue: Number(e.target.value)})} 
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500/50" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Priority</label>
                                        <input 
                                            type="number" 
                                            value={editForm.priority} 
                                            onChange={(e) => setEditForm({...editForm, priority: Number(e.target.value)})} 
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500/50" 
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdateRule} className="flex-1 h-12 bg-indigo-500 text-slate-950 font-black text-[10px] uppercase rounded-xl hover:scale-105 transition-transform">Save</button>
                                        <button onClick={() => setEditingRuleId(null)} className="flex-1 h-12 bg-white/5 text-slate-500 font-black text-[10px] uppercase rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${rule.status ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                                        <Tags size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white tracking-tighter capitalize italic">
                                            {getTargetName(rule)} <span className="text-indigo-400/50 not-italic text-xs ml-2">Markup</span>
                                        </h4>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Rule Priority: {rule.priority}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Impact</p>
                                        <p className="text-2xl font-black text-white tracking-tighter italic">{rule.markupType === 'percent' ? `+${rule.markupValue}%` : `+₦${rule.markupValue}`}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleStartEdit(rule)} className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl"><Edit3 size={18} /></button>
                                        <button onClick={() => handleUpdateStatus(rule._id, !rule.status)} className={`p-3 rounded-xl ${rule.status ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}><ShieldCheck size={18} /></button>
                                        <button onClick={() => handleDeleteRule(rule._id)} className="p-3 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingStrategyTab;
