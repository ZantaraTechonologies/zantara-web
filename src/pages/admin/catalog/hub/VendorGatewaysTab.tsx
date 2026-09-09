import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    RefreshCcw, 
    Globe, 
    Activity, 
    Wallet, 
    Cpu, 
    CheckCircle2, 
    Lock,
    ChevronDown,
    ChevronUp,
    Play,
    Sliders,
    HelpCircle
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { CardSkeleton } from '../../../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';

interface Provider {
    _id: string;
    name: string;
    adapterType: 'vtpass' | 'vas2nets' | 'universal';
    baseUrl: string;
    apiKeyConfigured?: boolean;
    apiKeyMasked?: string;
    secretKeyConfigured?: boolean;
    publicKey?: string;
    status: 'active' | 'inactive' | 'maintenance';
    balance: number;
    lastBalanceCheck?: string;
    metadata?: Record<string, any>;
}

interface FieldMapRow {
    zantaraField: string;
    providerField: string;
}

interface ProviderFormData {
    _id?: string;
    name: string;
    adapterType: 'vtpass' | 'vas2nets' | 'universal';
    baseUrl: string;
    apiKey: string;
    secretKey: string;
    publicKey: string;
    status: 'active' | 'inactive' | 'maintenance';
    
    // Universal Purchase Endpoints
    purchaseUrl: string;
    airtimePurchaseUrl: string;
    dataPurchaseUrl: string;
    electricityPurchaseUrl: string;
    cablePurchaseUrl: string;
    examPurchaseUrl: string;

    // Universal Other Endpoints
    queryUrl: string;
    balanceUrl: string;
    variationsUrl: string;
    verifyUrl: string;

    // Universal HTTP Methods
    method: string;
    airtimeMethod: string;
    dataMethod: string;
    electricityMethod: string;
    cableMethod: string;
    examMethod: string;
    queryMethod: string;
    balanceMethod: string;
    variationsMethod: string;
    verifyMethod: string;

    // Universal Auth Configuration
    authHeaderName: string;
    authHeaderValue: string;

    // Universal Request Field Mappings
    fieldMapRows: FieldMapRow[];

    // Universal Response Normalization
    successPath: string;
    successValue: string;
    statusPath: string;
    transactionIdPath: string;
    messagePath: string;
    balancePath: string;
    variationsPath: string;
}

const defaultFieldMapRows: FieldMapRow[] = [
    { zantaraField: 'phone', providerField: 'mobile_number' },
    { zantaraField: 'request_id', providerField: 'reference' },
    { zantaraField: 'variation_code', providerField: 'plan_id' },
    { zantaraField: 'serviceID', providerField: 'network' },
    { zantaraField: 'amount', providerField: 'amount' }
];

const initialFormState: ProviderFormData = {
    name: '',
    adapterType: 'vtpass',
    baseUrl: '',
    apiKey: '',
    secretKey: '',
    publicKey: '',
    status: 'active',

    purchaseUrl: '',
    airtimePurchaseUrl: '',
    dataPurchaseUrl: '',
    electricityPurchaseUrl: '',
    cablePurchaseUrl: '',
    examPurchaseUrl: '',

    queryUrl: '',
    balanceUrl: '',
    variationsUrl: '',
    verifyUrl: '',

    method: 'POST',
    airtimeMethod: '',
    dataMethod: '',
    electricityMethod: '',
    cableMethod: '',
    examMethod: '',
    queryMethod: 'POST',
    balanceMethod: 'GET',
    variationsMethod: 'GET',
    verifyMethod: 'POST',

    authHeaderName: 'Authorization',
    authHeaderValue: 'Bearer {{apiKey}}',

    fieldMapRows: defaultFieldMapRows,

    successPath: 'status',
    successValue: 'success',
    statusPath: '',
    transactionIdPath: '',
    messagePath: '',
    balancePath: 'balance',
    variationsPath: 'content.variations'
};

const HTTP_METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const VendorGatewaysTab: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [formData, setFormData] = useState<ProviderFormData>(initialFormState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
    const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

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

    const handleOpenCreateModal = () => {
        setEditingProvider(null);
        setFormData(initialFormState);
        setIsAdvancedOpen(true);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (provider: Provider) => {
        setEditingProvider(provider);
        const meta = provider.metadata || {};

        // Convert existing fieldMap into key-value rows
        let rows: FieldMapRow[] = [];
        if (meta.fieldMap && typeof meta.fieldMap === 'object') {
            rows = Object.entries(meta.fieldMap).map(([k, v]) => ({
                zantaraField: k,
                providerField: String(v)
            }));
        }
        if (rows.length === 0) {
            rows = defaultFieldMapRows;
        }

        setFormData({
            _id: provider._id,
            name: provider.name,
            adapterType: provider.adapterType,
            baseUrl: provider.baseUrl,
            apiKey: '', // Always start blank on edit for credential security
            secretKey: '', // Always start blank on edit for credential security
            publicKey: provider.publicKey || '',
            status: provider.status,

            purchaseUrl: meta.purchaseUrl || '',
            airtimePurchaseUrl: meta.airtimePurchaseUrl || '',
            dataPurchaseUrl: meta.dataPurchaseUrl || '',
            electricityPurchaseUrl: meta.electricityPurchaseUrl || '',
            cablePurchaseUrl: meta.cablePurchaseUrl || '',
            examPurchaseUrl: meta.examPurchaseUrl || '',

            queryUrl: meta.queryUrl || '',
            balanceUrl: meta.balanceUrl || '',
            variationsUrl: meta.variationsUrl || '',
            verifyUrl: meta.verifyUrl || '',

            method: meta.method || 'POST',
            airtimeMethod: meta.airtimeMethod || '',
            dataMethod: meta.dataMethod || '',
            electricityMethod: meta.electricityMethod || '',
            cableMethod: meta.cableMethod || '',
            examMethod: meta.examMethod || '',
            queryMethod: meta.queryMethod || 'POST',
            balanceMethod: meta.balanceMethod || 'GET',
            variationsMethod: meta.variationsMethod || 'GET',
            verifyMethod: meta.verifyMethod || 'POST',

            authHeaderName: meta.authHeaderName !== undefined ? meta.authHeaderName : 'Authorization',
            authHeaderValue: meta.authHeaderValue !== undefined ? meta.authHeaderValue : 'Bearer {{apiKey}}',

            fieldMapRows: rows,

            successPath: meta.successPath || 'status',
            successValue: meta.successValue || 'success',
            statusPath: meta.statusPath || '',
            transactionIdPath: meta.transactionIdPath || '',
            messagePath: meta.messagePath || '',
            balancePath: meta.balancePath || 'balance',
            variationsPath: meta.variationsPath || 'content.variations'
        });
        setIsAdvancedOpen(true);
        setIsModalOpen(true);
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

    const handleTestConnection = async (id: string, name: string) => {
        setTestingProviderId(id);
        try {
            toast.loading(`Testing connection to ${name}...`, { id: `test-conn-${id}` });
            const res = await apiClient.post(`/admin/providers/${id}/test-connection`);
            if (res.data.success) {
                toast.success(res.data.message || "Connection verified successfully!", { id: `test-conn-${id}` });
            } else {
                toast.error(res.data.message || "Connection test failed", { id: `test-conn-${id}` });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Connection test failed", { id: `test-conn-${id}` });
        } finally {
            setTestingProviderId(null);
        }
    };

    const handleAddFieldMapRow = () => {
        setFormData(prev => ({
            ...prev,
            fieldMapRows: [...prev.fieldMapRows, { zantaraField: '', providerField: '' }]
        }));
    };

    const handleRemoveFieldMapRow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fieldMapRows: prev.fieldMapRows.filter((_, idx) => idx !== index)
        }));
    };

    const handleFieldMapChange = (index: number, key: 'zantaraField' | 'providerField', value: string) => {
        setFormData(prev => {
            const updated = [...prev.fieldMapRows];
            updated[index] = { ...updated[index], [key]: value };
            return { ...prev, fieldMapRows: updated };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for new provider creation
        if (!editingProvider && !formData.apiKey.trim()) {
            toast.error("API Key is required for new provider integration");
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                name: formData.name.trim(),
                adapterType: formData.adapterType,
                baseUrl: formData.baseUrl.trim(),
                publicKey: formData.publicKey ? formData.publicKey.trim() : undefined,
                status: formData.status
            };

            // Omit blank credential inputs so existing encrypted backend values are retained
            if (formData.apiKey.trim()) {
                payload.apiKey = formData.apiKey.trim();
            }

            if (formData.secretKey.trim()) {
                payload.secretKey = formData.secretKey.trim();
            }

            // Universal metadata compilation
            if (formData.adapterType === 'universal') {
                const fieldMap: Record<string, string> = {};
                formData.fieldMapRows.forEach(row => {
                    const zKey = row.zantaraField.trim();
                    const pKey = row.providerField.trim();
                    if (zKey && pKey) {
                        fieldMap[zKey] = pKey;
                    }
                });

                const metadata: Record<string, any> = {};

                // Endpoints
                if (formData.purchaseUrl.trim()) metadata.purchaseUrl = formData.purchaseUrl.trim();
                if (formData.airtimePurchaseUrl.trim()) metadata.airtimePurchaseUrl = formData.airtimePurchaseUrl.trim();
                if (formData.dataPurchaseUrl.trim()) metadata.dataPurchaseUrl = formData.dataPurchaseUrl.trim();
                if (formData.electricityPurchaseUrl.trim()) metadata.electricityPurchaseUrl = formData.electricityPurchaseUrl.trim();
                if (formData.cablePurchaseUrl.trim()) metadata.cablePurchaseUrl = formData.cablePurchaseUrl.trim();
                if (formData.examPurchaseUrl.trim()) metadata.examPurchaseUrl = formData.examPurchaseUrl.trim();

                if (formData.queryUrl.trim()) metadata.queryUrl = formData.queryUrl.trim();
                if (formData.balanceUrl.trim()) metadata.balanceUrl = formData.balanceUrl.trim();
                if (formData.variationsUrl.trim()) metadata.variationsUrl = formData.variationsUrl.trim();
                if (formData.verifyUrl.trim()) metadata.verifyUrl = formData.verifyUrl.trim();

                // Methods
                if (formData.method) metadata.method = formData.method;
                if (formData.airtimeMethod) metadata.airtimeMethod = formData.airtimeMethod;
                if (formData.dataMethod) metadata.dataMethod = formData.dataMethod;
                if (formData.electricityMethod) metadata.electricityMethod = formData.electricityMethod;
                if (formData.cableMethod) metadata.cableMethod = formData.cableMethod;
                if (formData.examMethod) metadata.examMethod = formData.examMethod;
                if (formData.queryMethod) metadata.queryMethod = formData.queryMethod;
                if (formData.balanceMethod) metadata.balanceMethod = formData.balanceMethod;
                if (formData.variationsMethod) metadata.variationsMethod = formData.variationsMethod;
                if (formData.verifyMethod) metadata.verifyMethod = formData.verifyMethod;

                // Auth
                if (formData.authHeaderName.trim()) metadata.authHeaderName = formData.authHeaderName.trim();
                if (formData.authHeaderValue.trim()) metadata.authHeaderValue = formData.authHeaderValue.trim();

                // Field mappings
                if (Object.keys(fieldMap).length > 0) metadata.fieldMap = fieldMap;

                // Response normalization
                if (formData.successPath.trim()) metadata.successPath = formData.successPath.trim();
                if (formData.successValue.trim()) metadata.successValue = formData.successValue.trim();
                if (formData.statusPath.trim()) metadata.statusPath = formData.statusPath.trim();
                if (formData.transactionIdPath.trim()) metadata.transactionIdPath = formData.transactionIdPath.trim();
                if (formData.messagePath.trim()) metadata.messagePath = formData.messagePath.trim();
                if (formData.balancePath.trim()) metadata.balancePath = formData.balancePath.trim();
                if (formData.variationsPath.trim()) metadata.variationsPath = formData.variationsPath.trim();

                payload.metadata = metadata;
            }

            if (editingProvider?._id) {
                await apiClient.put(`/admin/providers/${editingProvider._id}`, payload);
                toast.success("Provider configuration updated");
            } else {
                await apiClient.post('/admin/providers', payload);
                toast.success("New provider integrated successfully");
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
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to remove provider");
        }
    };

    if (loading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">API Supply Infrastructure</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Configure & Monitor External API Gates</p>
                </div>

                <button 
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={16} />
                    Integrate New Provider
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {providers.map((provider) => (
                    <div key={provider._id} className="group relative bg-surface border border-slate-100 hover:border-emerald-500/30 rounded-3xl p-6 transition-all shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-105">
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">{provider.name}</h3>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[8px] font-mono uppercase font-black">
                                            {provider.adapterType}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            provider.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                            provider.status === 'maintenance' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                                            'bg-red-500/10 text-red-600 border border-red-500/20'
                                        }`}>
                                            <Activity size={10} />
                                            {provider.status}
                                        </span>
                                        {provider.apiKeyConfigured && (
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-mono border border-slate-200">
                                                <Lock size={8} /> API Key: {provider.apiKeyMasked || 'Configured'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleTestConnection(provider._id, provider.name)}
                                    disabled={testingProviderId === provider._id}
                                    title="Test Connection"
                                    className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-500/30 transition-all disabled:opacity-50"
                                >
                                    <Play size={14} className={testingProviderId === provider._id ? "animate-spin" : ""} />
                                </button>
                                <button 
                                    onClick={() => handleOpenEditModal(provider)}
                                    title="Configure Gateway"
                                    className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(provider._id)}
                                    title="Remove Gateway"
                                    className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">Vendor Liquidity</span>
                                    <Wallet size={12} className="text-emerald-500" />
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₦{provider.balance?.toLocaleString() || '0'}</h4>
                                    <button 
                                        onClick={() => handleCheckBalance(provider._id)}
                                        className="p-2 bg-surface hover:bg-emerald-500/20 rounded-lg text-slate-500 hover:text-emerald-500 transition-all border border-slate-200 shadow-sm"
                                        title="Query Balance"
                                    >
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">API Endpoint</span>
                                    <Globe size={12} className="text-blue-500" />
                                </div>
                                <p className="text-[10px] font-mono text-slate-600 truncate mt-1">{provider.baseUrl}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Logic */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-3xl bg-surface border border-slate-100 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-8">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {editingProvider?._id ? 'Update Gateway' : 'New API Connection' }
                                </h2>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-0.5 uppercase">
                                    {formData.adapterType === 'universal' ? 'Configure Universal Provider Endpoints & Mappings' : 'Dedicated Gateway Integration'}
                                </p>
                            </div>
                            {editingProvider?._id && (
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection(editingProvider._id, editingProvider.name)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-700 hover:text-emerald-600 hover:border-emerald-500/30 transition-all"
                                >
                                    <Play size={12} /> Test Connection
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
                            {/* SECTION A: Provider Identity */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders size={14} className="text-emerald-500" />
                                    Provider Identity
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gateway Name</label>
                                        <input 
                                            type="text" required
                                            placeholder="e.g. DoroSub Data"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base URL</label>
                                        <input 
                                            type="text" required
                                            placeholder="https://api.provider.com/v1"
                                            value={formData.baseUrl}
                                            onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adapter Type</label>
                                        <select 
                                            value={formData.adapterType}
                                            onChange={(e: any) => setFormData({...formData, adapterType: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <option value="vtpass">VTPass (Official)</option>
                                            <option value="vas2nets">Vas2Nets (Legacy)</option>
                                            <option value="universal">Universal Gateway (Self-Configurable)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e: any) => setFormData({...formData, status: e.target.value})}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <option value="active">Active</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="inactive">Disabled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: Credentials */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Lock size={14} className="text-emerald-500" />
                                    Credentials & Security
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key / Token</label>
                                            {editingProvider?.apiKeyConfigured && (
                                                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Configured ({editingProvider.apiKeyMasked})
                                                </span>
                                            )}
                                        </div>
                                        <input 
                                            type="password"
                                            value={formData.apiKey}
                                            onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                                            placeholder={editingProvider?.apiKeyConfigured ? "Leave blank to retain existing key" : "Required for connection"}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key / Password</label>
                                            {editingProvider?.secretKeyConfigured && (
                                                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Configured
                                                </span>
                                            )}
                                        </div>
                                        <input 
                                            type="password"
                                            value={formData.secretKey}
                                            onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                                            placeholder={editingProvider?.secretKeyConfigured ? "Leave blank to retain existing secret" : "Optional"}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50 font-mono"
                                        />
                                    </div>
                                    {formData.adapterType === 'vtpass' && (
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public Key (VTPass Sandbox)</label>
                                            <input 
                                                type="text"
                                                value={formData.publicKey}
                                                onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
                                                className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500/50 font-mono"
                                                placeholder="Optional public key"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* UNIVERSAL ADAPTER ONLY: ADVANCED API CONFIGURATION */}
                            {formData.adapterType === 'universal' && (
                                <div className="pt-3 border-t border-slate-200">
                                    <div 
                                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200"
                                    >
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <Sliders size={14} className="text-indigo-600" />
                                                ADVANCED API CONFIGURATION
                                            </h4>
                                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">Configure endpoints, HTTP methods, authentication templates, and mappings</p>
                                        </div>
                                        <div className="text-slate-500">
                                            {isAdvancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>

                                    {isAdvancedOpen && (
                                        <div className="mt-6 space-y-8 pl-1 pr-1">
                                            {/* C. Purchase Endpoints */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Purchase Endpoints</h5>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                        If a service-specific endpoint is empty, <strong className="text-slate-800">Generic Purchase URL</strong> will be used.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="sm:col-span-2 space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Generic Purchase URL *</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="/api/buy or https://api.provider.com/buy"
                                                            value={formData.purchaseUrl}
                                                            onChange={(e) => setFormData({...formData, purchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Airtime Purchase URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Optional override (e.g. /api/airtime)"
                                                            value={formData.airtimePurchaseUrl}
                                                            onChange={(e) => setFormData({...formData, airtimePurchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Data Purchase URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Optional override (e.g. /api/data)"
                                                            value={formData.dataPurchaseUrl}
                                                            onChange={(e) => setFormData({...formData, dataPurchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Electricity Purchase URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Optional override (e.g. /api/electricity)"
                                                            value={formData.electricityPurchaseUrl}
                                                            onChange={(e) => setFormData({...formData, electricityPurchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cable TV Purchase URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Optional override (e.g. /api/cable)"
                                                            value={formData.cablePurchaseUrl}
                                                            onChange={(e) => setFormData({...formData, cablePurchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2 space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Exam PIN Purchase URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Optional override (e.g. /api/exam)"
                                                            value={formData.examPurchaseUrl}
                                                            onChange={(e) => setFormData({...formData, examPurchaseUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* D. Other Endpoints */}
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Other Endpoints</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Transaction Query URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Default: /requery"
                                                            value={formData.queryUrl}
                                                            onChange={(e) => setFormData({...formData, queryUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Balance URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Default: /balance"
                                                            value={formData.balanceUrl}
                                                            onChange={(e) => setFormData({...formData, balanceUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Service Variations URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="e.g. /service-variations?serviceID={{serviceID}}"
                                                            value={formData.variationsUrl}
                                                            onChange={(e) => setFormData({...formData, variationsUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Customer Verification URL</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="e.g. /api/verify-merchant"
                                                            value={formData.verifyUrl}
                                                            onChange={(e) => setFormData({...formData, verifyUrl: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* E. HTTP Methods */}
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">HTTP Methods</h5>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Default Method</label>
                                                        <select
                                                            value={formData.method}
                                                            onChange={(e) => setFormData({...formData, method: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Airtime Method</label>
                                                        <select
                                                            value={formData.airtimeMethod}
                                                            onChange={(e) => setFormData({...formData, airtimeMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            <option value="">(Inherit Default)</option>
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Data Method</label>
                                                        <select
                                                            value={formData.dataMethod}
                                                            onChange={(e) => setFormData({...formData, dataMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            <option value="">(Inherit Default)</option>
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Query Method</label>
                                                        <select
                                                            value={formData.queryMethod}
                                                            onChange={(e) => setFormData({...formData, queryMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Balance Method</label>
                                                        <select
                                                            value={formData.balanceMethod}
                                                            onChange={(e) => setFormData({...formData, balanceMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Variations Method</label>
                                                        <select
                                                            value={formData.variationsMethod}
                                                            onChange={(e) => setFormData({...formData, variationsMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Electricity Method</label>
                                                        <select
                                                            value={formData.electricityMethod}
                                                            onChange={(e) => setFormData({...formData, electricityMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            <option value="">(Inherit Default)</option>
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase">Verify Method</label>
                                                        <select
                                                            value={formData.verifyMethod}
                                                            onChange={(e) => setFormData({...formData, verifyMethod: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                                        >
                                                            {HTTP_METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* F. Authentication Header */}
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Authentication Header</h5>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                        <HelpCircle size={12} className="text-emerald-500" />
                                                        Use <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">&#123;&#123;apiKey&#125;&#125;</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">&#123;&#123;secretKey&#125;&#125;</code>, or <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">&#123;&#123;publicKey&#125;&#125;</code> placeholders. Actual credentials are resolved securely on the server.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Auth Header Name</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Authorization or X-API-Key"
                                                            value={formData.authHeaderName}
                                                            onChange={(e) => setFormData({...formData, authHeaderName: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Auth Header Value Template</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Bearer {{apiKey}} or {{apiKey}}"
                                                            value={formData.authHeaderValue}
                                                            onChange={(e) => setFormData({...formData, authHeaderValue: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* G. Request Field Mapping */}
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Request Field Mapping</h5>
                                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                            Translate internal Zantara parameters into the provider's specific API request payload keys.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddFieldMapRow}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black text-slate-700 hover:text-indigo-600 uppercase transition-all"
                                                    >
                                                        <Plus size={12} /> Add Field
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider px-2">
                                                        <div className="col-span-5">Zantara Field</div>
                                                        <div className="col-span-6">Provider Field</div>
                                                        <div className="col-span-1 text-center">Action</div>
                                                    </div>

                                                    {formData.fieldMapRows.map((row, idx) => (
                                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                            <div className="col-span-5">
                                                                <input 
                                                                    type="text"
                                                                    placeholder="e.g. phone"
                                                                    value={row.zantaraField}
                                                                    onChange={(e) => handleFieldMapChange(idx, 'zantaraField', e.target.value)}
                                                                    className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            <div className="col-span-6">
                                                                <input 
                                                                    type="text"
                                                                    placeholder="e.g. mobile_number"
                                                                    value={row.providerField}
                                                                    onChange={(e) => handleFieldMapChange(idx, 'providerField', e.target.value)}
                                                                    className="w-full bg-surface border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 flex justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFieldMapRow(idx)}
                                                                    disabled={formData.fieldMapRows.length <= 1}
                                                                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* H. Response Mapping */}
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Response Mapping</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Success Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="status or response.code"
                                                            value={formData.successPath}
                                                            onChange={(e) => setFormData({...formData, successPath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Success Value</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="success or 200 or 000"
                                                            value={formData.successValue}
                                                            onChange={(e) => setFormData({...formData, successValue: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Status Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="data.status"
                                                            value={formData.statusPath}
                                                            onChange={(e) => setFormData({...formData, statusPath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Transaction ID Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="data.transaction_id or reference"
                                                            value={formData.transactionIdPath}
                                                            onChange={(e) => setFormData({...formData, transactionIdPath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Message Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="message or response_description"
                                                            value={formData.messagePath}
                                                            onChange={(e) => setFormData({...formData, messagePath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Balance Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="balance or data.wallet.balance"
                                                            value={formData.balancePath}
                                                            onChange={(e) => setFormData({...formData, balancePath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2 space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Variations List Path</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="content.variations or data.plans"
                                                            value={formData.variationsPath}
                                                            onChange={(e) => setFormData({...formData, variationsPath: e.target.value})}
                                                            className="w-full bg-surface border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>

                        <div className="p-6 pt-4 border-t border-slate-100 flex gap-4 bg-surface">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)} 
                                className="flex-1 py-3 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Syncing...' : 'Deploy Gateway'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorGatewaysTab;
