import React, { useEffect, useState, useCallback } from 'react';
import {
    CreditCard,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Plus,
    Activity,
    Lock,
    KeyRound,
    Radio,
    Zap,
    AlertTriangle,
    Clock,
    X,
    Check,
    Layers,
    Info,
    ChevronDown,
    Globe,
} from 'lucide-react';
import {
    PaymentGatewayItem,
    ReconciliationTransaction,
    AdapterCapability,
    getPaymentGateways,
    createPaymentGateway,
    updatePaymentGateway,
    updateGatewayStatus,
    setDefaultGateway,
    testGatewayConnection,
    getReconciliationTransactions,
    getAdapterCapabilities,
} from '../../../services/admin/adminPaymentGatewayService';
import { toast } from 'react-hot-toast';

// ─── Local fallback registry (mirrors backend, safe data only) ────────────────
// Used if /capabilities endpoint is unavailable. Keep in sync with
// adapters/payment/paymentAdapterRegistry.js on the backend.
const FALLBACK_CAPABILITIES: AdapterCapability[] = [
    {
        code: 'paystack',
        label: 'Paystack',
        defaultBaseUrl: 'https://api.paystack.co',
        supportedChannels: ['card', 'bank_transfer', 'ussd'],
        credentialFields: [
            { key: 'publicKey',     label: 'Public Key',      type: 'text',     sensitive: false, required: true,  placeholder: 'pk_test_...' },
            { key: 'secretKey',     label: 'Secret Key',      type: 'password', sensitive: true,  required: true,  placeholder: 'sk_test_...' },
            { key: 'webhookSecret', label: 'Webhook Secret',  type: 'password', sensitive: true,  required: false, placeholder: 'Leave blank to use Secret Key' },
        ],
        metadataFields: [],
    },
    {
        code: 'monnify',
        label: 'Monnify',
        defaultBaseUrl: 'https://sandbox.monnify.com',
        supportedChannels: ['card', 'bank_transfer', 'virtual_account'],
        credentialFields: [
            { key: 'publicKey',     label: 'API Key',         type: 'text',     sensitive: false, required: true,  placeholder: 'MK_...' },
            { key: 'secretKey',     label: 'Secret Key',      type: 'password', sensitive: true,  required: true,  placeholder: 'Monnify secret key' },
            { key: 'webhookSecret', label: 'Webhook Secret',  type: 'password', sensitive: true,  required: false, placeholder: 'Leave blank to use Secret Key' },
        ],
        metadataFields: [
            { key: 'contractCode', label: 'Contract Code', type: 'text', sensitive: false, required: true, placeholder: 'e.g. 1234567890' },
        ],
    },
    {
        code: 'flutterwave',
        label: 'Flutterwave',
        defaultBaseUrl: 'https://api.flutterwave.com/v3',
        supportedChannels: ['card', 'bank_transfer', 'ussd'],
        credentialFields: [
            { key: 'publicKey',     label: 'Public Key',      type: 'text',     sensitive: false, required: false, placeholder: 'FLWPUBK_TEST-...' },
            { key: 'secretKey',     label: 'Secret Key',      type: 'password', sensitive: true,  required: true,  placeholder: 'FLWSECK_TEST-...' },
            { key: 'webhookSecret', label: 'Webhook Hash',    type: 'password', sensitive: true,  required: false, placeholder: 'verif-hash header value' },
        ],
        metadataFields: [],
    },
];

const CHANNEL_DISPLAY: Record<string, string> = {
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD',
    virtual_account: 'Virtual Account',
};

// ─── Helper: slugify display name into a safe gateway code ───────────────────
function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// ─── Section header component for consistent style ───────────────────────────
const SectionLabel: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${color} inline-block shrink-0`} />
        {children}
    </p>
);

// ─── Label component ─────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; htmlFor?: string; extra?: React.ReactNode }> = ({ children, htmlFor, extra }) => (
    <label htmlFor={htmlFor} className="flex items-center justify-between mb-1.5">
        <span className="block text-sm font-semibold text-slate-700">{children}</span>
        {extra}
    </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPaymentGatewaysPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'gateways' | 'reconciliation'>('gateways');
    const [loading, setLoading] = useState(true);
    const [gateways, setGateways] = useState<PaymentGatewayItem[]>([]);
    const [reconciliations, setReconciliations] = useState<ReconciliationTransaction[]>([]);
    const [capabilities, setCapabilities] = useState<AdapterCapability[]>(FALLBACK_CAPABILITIES);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayItem | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formAdapterType, setFormAdapterType] = useState<string>('paystack');
    const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'maintenance'>('inactive');
    const [formEnvironment, setFormEnvironment] = useState<'test' | 'live'>('test');
    const [formIsDefault, setFormIsDefault] = useState(false);
    const [formBaseUrl, setFormBaseUrl] = useState('');
    const [formChannels, setFormChannels] = useState<string[]>([]);
    const [formMetadata, setFormMetadata] = useState<Record<string, string>>({});
    // Credential fields: keyed by field.key (publicKey / secretKey / webhookSecret)
    const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

    // ─── Derived: current adapter spec ──────────────────────────────────────
    const currentSpec = capabilities.find(c => c.code === formAdapterType) ?? capabilities[0];

    // ─── Data fetching ───────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [gwRes, recRes, capRes] = await Promise.allSettled([
                getPaymentGateways(),
                getReconciliationTransactions(),
                getAdapterCapabilities(),
            ]);
            if (gwRes.status === 'fulfilled' && gwRes.value.success) setGateways(gwRes.value.data || []);
            if (recRes.status === 'fulfilled' && recRes.value.success) setReconciliations(recRes.value.data || []);
            if (capRes.status === 'fulfilled' && capRes.value.success && capRes.value.data?.length) {
                setCapabilities(capRes.value.data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load payment gateway data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Action handlers ─────────────────────────────────────────────────────
    const handleTestConnection = async (gateway: PaymentGatewayItem) => {
        try {
            setTestingId(gateway._id);
            const res = await testGatewayConnection(gateway._id);
            if (res.success) toast.success(res.message || `Connection to ${gateway.name} succeeded!`);
            else toast.error(res.message || `Connection to ${gateway.name} failed`);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Connection test failed');
        } finally {
            setTestingId(null);
        }
    };

    const handleSetDefault = (gateway: PaymentGatewayItem) => {
        if (gateway.status !== 'active') {
            toast.error('Only an ACTIVE gateway can be set as the default fallback.');
            return;
        }
        setConfirmDialog({
            isOpen: true,
            title: `Set ${gateway.name} as Default?`,
            message: `This will make ${gateway.name} the platform default fallback when clients do not explicitly choose another gateway. The current default will be replaced safely.`,
            type: 'info',
            onConfirm: async () => {
                try {
                    setActionLoadingId(gateway._id);
                    const res = await setDefaultGateway(gateway._id);
                    if (res.success) { toast.success(`${gateway.name} is now the default payment gateway`); fetchData(); }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || error.message || 'Failed to set default gateway');
                } finally {
                    setActionLoadingId(null);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleToggleStatus = (gateway: PaymentGatewayItem) => {
        const nextStatus = gateway.status === 'active' ? 'inactive' : 'active';
        const isDeactivating = nextStatus === 'inactive';
        setConfirmDialog({
            isOpen: true,
            title: isDeactivating ? `Deactivate ${gateway.name}?` : `Activate ${gateway.name}?`,
            message: isDeactivating
                ? 'New wallet funding transactions will no longer be initialized through this gateway. Existing transactions retain their gateway binding.'
                : `Activating ${gateway.name} allows users to fund wallets through its enabled channels. Other active gateways remain active simultaneously.`,
            type: isDeactivating ? 'warning' : 'info',
            onConfirm: async () => {
                try {
                    setActionLoadingId(gateway._id);
                    const res = await updateGatewayStatus(gateway._id, nextStatus);
                    if (res.success) { toast.success(`${gateway.name} is now ${nextStatus.toUpperCase()}`); fetchData(); }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || error.message || 'Failed to update status');
                } finally {
                    setActionLoadingId(null);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    // ─── Modal open ──────────────────────────────────────────────────────────
    const openEditModal = (gateway?: PaymentGatewayItem) => {
        if (gateway) {
            setSelectedGateway(gateway);
            setFormName(gateway.name);
            setFormCode(gateway.code);
            setFormAdapterType(gateway.adapterType);
            setFormStatus(gateway.status);
            setFormEnvironment(gateway.environment);
            setFormIsDefault(gateway.isDefault);
            setFormBaseUrl(gateway.baseUrl || '');
            setFormChannels(gateway.supportedChannels || []);
            setFormMetadata({ contractCode: gateway.metadata?.contractCode || '' });
            // Secret fields always start blank on edit
            setFormCredentials({ publicKey: gateway.publicKey || '', secretKey: '', webhookSecret: '' });
        } else {
            const defaultSpec = capabilities.find(c => c.code === 'paystack') ?? capabilities[0];
            setSelectedGateway(null);
            setFormName('');
            setFormCode('');
            setFormAdapterType(defaultSpec.code);
            setFormStatus('inactive');
            setFormEnvironment('test');
            setFormIsDefault(false);
            setFormBaseUrl(defaultSpec.defaultBaseUrl);
            setFormChannels([...defaultSpec.supportedChannels]);
            setFormMetadata({});
            setFormCredentials({ publicKey: '', secretKey: '', webhookSecret: '' });
        }
        setIsEditModalOpen(true);
    };

    // ─── Adapter change: resets channels to adapter defaults, clears credentials ─
    const handleAdapterChange = (code: string) => {
        const spec = capabilities.find(c => c.code === code);
        if (!spec) return;
        setFormAdapterType(code);
        if (!selectedGateway) {
            setFormBaseUrl(spec.defaultBaseUrl);
            setFormChannels([...spec.supportedChannels]);
            setFormMetadata({});
            setFormCredentials({ publicKey: '', secretKey: '', webhookSecret: '' });
        }
    };

    // ─── Auto-derive code from name on new gateway ───────────────────────────
    const handleNameChange = (value: string) => {
        setFormName(value);
        if (!selectedGateway) {
            setFormCode(slugify(value));
        }
    };

    // ─── Channel toggle (only allows channels the adapter supports) ──────────
    const handleChannelToggle = (channel: string) => {
        if (!currentSpec.supportedChannels.includes(channel)) return;
        setFormChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    // ─── Default guard: if status is not active, cannot be default ───────────
    const handleStatusChange = (status: 'active' | 'inactive' | 'maintenance') => {
        setFormStatus(status);
        if (status !== 'active') setFormIsDefault(false);
    };

    // ─── Form submit ─────────────────────────────────────────────────────────
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formEnvironment === 'live' && (!selectedGateway || selectedGateway.environment !== 'live')) {
            const confirmed = window.confirm(
                `CONFIRMATION REQUIRED:\nYou are setting ${formName || 'this gateway'} to LIVE mode.\nReal money payments will be debited from customers using production credentials.\n\nDo you wish to proceed?`
            );
            if (!confirmed) return;
        }

        try {
            setSaving(true);

            // Build metadata from current adapter's metadataFields
            const metadataPayload: Record<string, string> = {};
            (currentSpec?.metadataFields || []).forEach(field => {
                if (formMetadata[field.key] !== undefined) {
                    metadataPayload[field.key] = formMetadata[field.key];
                }
            });

            const payload: any = {
                name: formName.trim(),
                adapterType: formAdapterType,
                status: formStatus,
                environment: formEnvironment,
                isDefault: formIsDefault,
                baseUrl: formBaseUrl.trim(),
                publicKey: (formCredentials.publicKey || '').trim(),
                supportedChannels: formChannels,
                metadata: metadataPayload,
            };

            // Only send secrets if non-empty (blank = retain existing)
            if ((formCredentials.secretKey || '').trim() !== '') {
                payload.secretKey = formCredentials.secretKey.trim();
            }
            if ((formCredentials.webhookSecret || '').trim() !== '') {
                payload.webhookSecret = formCredentials.webhookSecret.trim();
            }

            if (selectedGateway) {
                await updatePaymentGateway(selectedGateway._id, payload);
                toast.success(`${formName} updated successfully`);
            } else {
                payload.code = formCode.toLowerCase().trim();
                await createPaymentGateway(payload);
                toast.success(`Payment gateway ${formName} registered successfully`);
            }

            setIsEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Failed to save gateway configuration');
        } finally {
            setSaving(false);
        }
    };

    // ─── Derived stats ───────────────────────────────────────────────────────
    const activeCount = gateways.filter(g => g.status === 'active').length;
    const defaultGateway = gateways.find(g => g.isDefault);
    const issuesCount = reconciliations.length;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Payment Gateways</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Multi-gateway orchestration, encrypted credential storage &amp; transaction reconciliation
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => openEditModal()}
                        className="px-4 py-2 bg-brand-emerald text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Gateway</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 text-slate-700 rounded-xl"><Layers className="w-5 h-5" /></div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Gateways</div>
                        <div className="text-xl font-black text-slate-900">{gateways.length}</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity className="w-5 h-5" /></div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Gateways</div>
                        <div className="text-xl font-black text-emerald-600">{activeCount} Concurrent</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Radio className="w-5 h-5" /></div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Fallback</div>
                        <div className="text-base font-black text-slate-900 truncate max-w-[150px]">
                            {defaultGateway ? defaultGateway.name : 'None Assigned'}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${issuesCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reconciliation Issues</div>
                        <div className={`text-xl font-black ${issuesCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{issuesCount} In-Flight</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => setActiveTab('gateways')}
                    className={`pb-3 text-xs font-bold tracking-tight transition-all flex items-center gap-2 relative ${activeTab === 'gateways' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Gateways ({gateways.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('reconciliation')}
                    className={`pb-3 text-xs font-bold tracking-tight transition-all flex items-center gap-2 relative ${activeTab === 'reconciliation' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reconciliation &amp; In-Flight</span>
                    {issuesCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white">{issuesCount}</span>
                    )}
                </button>
            </div>

            {/* ── Tab 1: Gateway Cards ── */}
            {activeTab === 'gateways' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gateways.map(gw => {
                        const isTesting = testingId === gw._id;
                        const isActionBusy = actionLoadingId === gw._id;
                        const healthStatus = gw.lastHealthCheck?.status || 'unknown';
                        return (
                            <div
                                key={gw._id}
                                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${gw.isDefault ? 'border-brand-emerald/40 ring-1 ring-brand-emerald/20' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 text-base">{gw.name}</h3>
                                                {gw.isDefault && (
                                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md tracking-wider uppercase">DEFAULT</span>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-500">code: {gw.code}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${gw.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : gw.status === 'maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                {gw.status}
                                            </span>
                                            <span className={`px-2 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${gw.environment === 'live' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-300'}`}>
                                                {gw.environment}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supported Channels</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {gw.supportedChannels && gw.supportedChannels.length > 0 ? (
                                                gw.supportedChannels.map(ch => (
                                                    <span key={ch} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                                                        {CHANNEL_DISPLAY[ch] || ch}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">No channels enabled</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Lock className="w-3 h-3" />
                                            <span>Credential Security</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {[
                                                { label: 'Secret Key', configured: gw.secretKeyConfigured },
                                                { label: 'Webhook Secret', configured: gw.webhookSecretConfigured },
                                            ].map(({ label, configured }) => (
                                                <div key={label} className="flex items-center gap-2">
                                                    {configured
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                        : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                                                    <div>
                                                        <div className="text-[10px] text-slate-500">{label}</div>
                                                        <div className={`font-bold text-[11px] ${configured ? 'text-slate-800' : 'text-slate-500'}`}>
                                                            {configured ? 'Configured' : 'Missing'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-5 flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${healthStatus === 'online' ? 'bg-emerald-500 ring-4 ring-emerald-100' : healthStatus === 'offline' ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-slate-400'}`} />
                                            <div>
                                                <div className="font-bold text-slate-800 capitalize text-[11px]">Health: {healthStatus}</div>
                                                {gw.lastHealthCheck?.checkedAt && (
                                                    <div className="text-[10px] text-slate-500">Checked {new Date(gw.lastHealthCheck.checkedAt).toLocaleTimeString()}</div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleTestConnection(gw)}
                                            disabled={isTesting}
                                            className="px-2.5 py-1 text-[10px] font-bold text-brand-emerald bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                                            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(gw)}
                                            disabled={isActionBusy}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${gw.status === 'active' ? 'text-slate-600 bg-slate-100 hover:bg-slate-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                                        >
                                            {gw.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        {!gw.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(gw)}
                                                disabled={isActionBusy || gw.status !== 'active'}
                                                title={gw.status !== 'active' ? 'Gateway must be active to set as default' : 'Set as primary fallback default'}
                                                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Make Default
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => openEditModal(gw)}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Configure
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Tab 2: Reconciliation ── */}
            {activeTab === 'reconciliation' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Funding Reconciliation &amp; In-Flight Audit</h2>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Transactions in <span className="font-bold text-amber-700">processing</span> or <span className="font-bold text-rose-700">reconciliation_required</span> state.
                            </p>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl">{reconciliations.length} Total</span>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-3 text-xs">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold">Financial Integrity Rule</div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                                In-flight <span className="font-mono font-bold">processing</span> locks prevent duplicate crediting across webhook retries.
                                Direct manual credit requires audited bank-statement verification.
                            </div>
                        </div>
                    </div>
                    {reconciliations.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-slate-800 text-sm">All Transactions Reconciled</div>
                            <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">No funding transactions are stuck in processing or require manual investigation.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                        <th className="pb-3">Reference</th>
                                        <th className="pb-3">Gateway</th>
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3">Expected</th>
                                        <th className="pb-3">Confirmed</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Elapsed / Issue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reconciliations.map(tx => (
                                        <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 font-mono font-bold text-slate-900">{tx.reference}</td>
                                            <td className="py-3.5 capitalize font-semibold text-slate-700">{tx.gateway}</td>
                                            <td className="py-3.5">
                                                <div className="font-bold text-slate-800">{tx.user?.name || 'Customer'}</div>
                                                <div className="text-[10px] text-slate-500">{tx.user?.email || tx.user?.phone || ''}</div>
                                            </td>
                                            <td className="py-3.5 font-bold text-slate-900">₦{Number(tx.expectedAmount || 0).toLocaleString()} <span className="text-[10px] text-slate-500">{tx.expectedCurrency}</span></td>
                                            <td className="py-3.5 font-bold">
                                                {tx.confirmedAmount !== null
                                                    ? <span className={tx.confirmedAmount !== tx.expectedAmount ? 'text-rose-600' : 'text-slate-900'}>₦{Number(tx.confirmedAmount).toLocaleString()}</span>
                                                    : <span className="text-slate-400 italic">Unconfirmed</span>}
                                            </td>
                                            <td className="py-3.5">
                                                {tx.status === 'processing'
                                                    ? <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">PROCESSING</span>
                                                    : <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">RECONCILE</span>}
                                            </td>
                                            <td className="py-3.5 max-w-xs">
                                                {tx.status === 'processing'
                                                    ? <div className="flex items-center gap-1.5 text-amber-700 font-medium"><Clock className="w-3.5 h-3.5 shrink-0" /><span>{tx.elapsedMinutes} mins in-flight</span></div>
                                                    : <div className="text-rose-700 font-medium text-[11px]">{tx.reconciliationReason || 'Audit mismatch'}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL: Add / Edit Payment Gateway
            ══════════════════════════════════════════════════════════════ */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
                    <div className="bg-white rounded-[2rem] max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 rounded-t-[2rem]">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {selectedGateway ? `Edit: ${selectedGateway.name}` : 'Register New Payment Gateway'}
                                </h2>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    {selectedGateway
                                        ? 'Update credentials, channels, and gateway settings.'
                                        : 'Configure a new payment gateway adapter for wallet funding.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto px-8 py-7 space-y-8 custom-scrollbar">

                                {/* ── SECTION 1: Gateway Identity ── */}
                                <div>
                                    <SectionLabel color="bg-indigo-500">Gateway Identity</SectionLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Display Name */}
                                        <div>
                                            <FieldLabel htmlFor="gw-name">Display Name</FieldLabel>
                                            <input
                                                id="gw-name"
                                                type="text"
                                                required
                                                value={formName}
                                                onChange={e => handleNameChange(e.target.value)}
                                                placeholder="e.g. Paystack Live"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                                            />
                                        </div>

                                        {/* Internal Code */}
                                        <div>
                                            <FieldLabel htmlFor="gw-code">
                                                Internal Code
                                                {selectedGateway && <span className="text-xs font-normal text-slate-500 italic ml-1">(immutable — linked to transactions)</span>}
                                            </FieldLabel>
                                            <input
                                                id="gw-code"
                                                type="text"
                                                required
                                                disabled={!!selectedGateway}
                                                value={formCode}
                                                onChange={e => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="e.g. paystack"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />
                                            {!selectedGateway && (
                                                <p className="mt-1.5 text-xs text-slate-500">
                                                    Lowercase letters, digits, and underscores only. Cannot be changed after transactions reference it.
                                                </p>
                                            )}
                                        </div>

                                        {/* Adapter Engine */}
                                        <div>
                                            <FieldLabel htmlFor="gw-adapter">
                                                Adapter Engine
                                                {selectedGateway && <span className="text-xs font-normal text-slate-500 italic ml-1">(immutable after creation)</span>}
                                            </FieldLabel>
                                            <div className="relative">
                                                <select
                                                    id="gw-adapter"
                                                    value={formAdapterType}
                                                    onChange={e => handleAdapterChange(e.target.value)}
                                                    disabled={!!selectedGateway}
                                                    className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                >
                                                    {capabilities.map(cap => (
                                                        <option key={cap.code} value={cap.code}>{cap.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            </div>
                                            <p className="mt-1.5 text-xs text-slate-500">
                                                Selects the integration implementation. Different from display name.
                                            </p>
                                        </div>

                                        {/* Operational Status */}
                                        <div>
                                            <FieldLabel htmlFor="gw-status">Operational Status</FieldLabel>
                                            <div className="relative">
                                                <select
                                                    id="gw-status"
                                                    value={formStatus}
                                                    onChange={e => handleStatusChange(e.target.value as any)}
                                                    className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                                                >
                                                    <option value="inactive">Inactive — Disabled, not receiving payments</option>
                                                    <option value="active">Active — Receiving live payments</option>
                                                    <option value="maintenance">Maintenance — Temporarily suspended</option>
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            </div>
                                            {!selectedGateway && (
                                                <p className="mt-1.5 text-xs text-slate-500">New gateways default to Inactive — activate once credentials are verified.</p>
                                            )}
                                        </div>

                                        {/* Base URL */}
                                        <div className="md:col-span-2">
                                            <FieldLabel htmlFor="gw-baseurl">Base API URL</FieldLabel>
                                            <div className="relative">
                                                <Globe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    id="gw-baseurl"
                                                    type="text"
                                                    value={formBaseUrl}
                                                    onChange={e => setFormBaseUrl(e.target.value)}
                                                    placeholder={currentSpec?.defaultBaseUrl || 'https://api.example.com'}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── SECTION 2: Environment & Routing ── */}
                                <div>
                                    <SectionLabel color="bg-violet-500">Environment &amp; Routing</SectionLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Environment Mode */}
                                        <div>
                                            <FieldLabel>Environment Mode</FieldLabel>
                                            <div className="flex gap-3">
                                                {(['test', 'live'] as const).map(env => (
                                                    <label
                                                        key={env}
                                                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer select-none transition-all ${
                                                            formEnvironment === env
                                                                ? env === 'live' ? 'border-violet-500 bg-violet-50' : 'border-slate-400 bg-slate-100'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="env"
                                                            value={env}
                                                            checked={formEnvironment === env}
                                                            onChange={() => setFormEnvironment(env)}
                                                            className={env === 'live' ? 'text-violet-600 focus:ring-violet-400' : 'text-slate-600'}
                                                        />
                                                        <span className={`text-sm font-bold ${env === 'live' && formEnvironment === 'live' ? 'text-violet-700' : 'text-slate-800'}`}>
                                                            {env === 'test' ? 'Test' : 'Live'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formEnvironment === 'live' && (
                                                <p className="mt-2 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                    Debits real customer funds. A confirmation prompt will appear on save.
                                                </p>
                                            )}
                                        </div>

                                        {/* Platform Default */}
                                        <div>
                                            <FieldLabel>Platform Default</FieldLabel>
                                            {formStatus !== 'active' ? (
                                                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50">
                                                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                    <p className="text-sm text-slate-600">
                                                        Activate this gateway before making it the platform default.
                                                    </p>
                                                </div>
                                            ) : (
                                                <label className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all ${formIsDefault ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formIsDefault}
                                                        onChange={e => setFormIsDefault(e.target.checked)}
                                                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Set as default gateway</p>
                                                        <p className="text-xs text-slate-600 mt-0.5">Used as fallback when no gateway is explicitly chosen by the client</p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ── SECTION 3: Supported Channels (adapter-driven) ── */}
                                <div>
                                    <SectionLabel color="bg-sky-500">Supported Channels</SectionLabel>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {currentSpec?.supportedChannels.map(ch => (
                                            <label
                                                key={ch}
                                                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 cursor-pointer select-none transition-all ${
                                                    formChannels.includes(ch)
                                                        ? 'border-sky-400 bg-sky-50 text-sky-900 font-semibold'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formChannels.includes(ch)}
                                                    onChange={() => handleChannelToggle(ch)}
                                                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 shrink-0"
                                                />
                                                <span className="text-sm">{CHANNEL_DISPLAY[ch] || ch}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Only channels supported by the <strong className="text-slate-700">{currentSpec?.label}</strong> adapter are shown. Switching adapters resets channels.
                                    </p>
                                </div>

                                {/* ── SECTION 4: Encrypted Credentials (adapter-specific labels) ── */}
                                <div>
                                    <SectionLabel color="bg-emerald-500">Encrypted Credentials</SectionLabel>
                                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                        {/* Vault header bar */}
                                        <div className="flex items-center justify-between px-5 py-3 bg-slate-800">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-xs font-bold text-slate-200">Vault — AES-256-GCM encrypted at rest</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                Secure
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-5 bg-slate-50">
                                            {selectedGateway && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
                                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    Leave <strong>Secret Key</strong> or <strong>Webhook Secret</strong> blank to retain the current encrypted value.
                                                </div>
                                            )}

                                            {/* Render credential fields from adapter registry */}
                                            {(currentSpec?.credentialFields || []).map(field => {
                                                const isSensitive = field.sensitive;
                                                const isConfigured = selectedGateway && (
                                                    field.key === 'secretKey' ? selectedGateway.secretKeyConfigured :
                                                    field.key === 'webhookSecret' ? selectedGateway.webhookSecretConfigured :
                                                    !!(selectedGateway as any)[field.key]
                                                );
                                                const configuredBadge = selectedGateway && isSensitive ? (
                                                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isConfigured ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        {isConfigured ? <><Check className="w-3 h-3" /> Configured</> : 'Not configured'}
                                                    </span>
                                                ) : null;

                                                return (
                                                    <div key={field.key}>
                                                        <FieldLabel htmlFor={`cred-${field.key}`} extra={configuredBadge}>
                                                            {field.label}
                                                            {field.required && <span className="ml-1 text-rose-500">*</span>}
                                                        </FieldLabel>
                                                        <input
                                                            id={`cred-${field.key}`}
                                                            type={field.type}
                                                            value={formCredentials[field.key] || ''}
                                                            onChange={e => setFormCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                            placeholder={selectedGateway && isSensitive && isConfigured
                                                                ? '•••••• (blank = keep current)'
                                                                : field.placeholder}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                                                        />
                                                    </div>
                                                );
                                            })}

                                            {/* Adapter-specific metadata fields (e.g. Monnify Contract Code) */}
                                            {(currentSpec?.metadataFields || []).map(field => (
                                                <div key={field.key}>
                                                    <FieldLabel htmlFor={`meta-${field.key}`}>
                                                        {field.label}
                                                        {field.required && <span className="ml-1 text-rose-500">*</span>}
                                                    </FieldLabel>
                                                    <input
                                                        id={`meta-${field.key}`}
                                                        type={field.type}
                                                        value={formMetadata[field.key] || ''}
                                                        onChange={e => setFormMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                        placeholder={field.placeholder}
                                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>{/* end scrollable body */}

                            {/* ── Sticky Footer ── */}
                            <div className="shrink-0 border-t border-slate-200 bg-white px-8 py-5 rounded-b-[2rem] flex items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 hidden sm:block">
                                    {selectedGateway
                                        ? 'Credentials stored encrypted · blank secret = retain existing · changes take effect immediately'
                                        : 'Gateway starts in the selected status above · credentials encrypted before storage'}
                                </p>
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-7 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        <span>{selectedGateway ? 'Save Changes' : 'Create Gateway'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirmation Dialog ── */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${
                                confirmDialog.type === 'danger' ? 'bg-rose-50 text-rose-600' :
                                confirmDialog.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                            }`}>
                                {confirmDialog.type === 'danger' ? <AlertCircle className="w-5 h-5" /> :
                                 confirmDialog.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                 <Zap className="w-5 h-5" />}
                            </div>
                            <h3 className="text-base font-black text-slate-900">{confirmDialog.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex items-center gap-3 pt-1">
                            <button
                                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all text-white ${
                                    confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                                    confirmDialog.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                                    'bg-slate-900 hover:bg-slate-800'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentGatewaysPage;
