import React, { useEffect, useState } from 'react';
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
    Sliders,
    Zap,
    ExternalLink,
    AlertTriangle,
    Clock,
    X,
    Server,
    Check,
    Layers,
    Info
} from 'lucide-react';
import {
    PaymentGatewayItem,
    ReconciliationTransaction,
    getPaymentGateways,
    createPaymentGateway,
    updatePaymentGateway,
    updateGatewayStatus,
    setDefaultGateway,
    testGatewayConnection,
    getReconciliationTransactions
} from '../../../services/admin/adminPaymentGatewayService';
import { toast } from 'react-hot-toast';

const CHANNEL_LABELS: Record<string, string> = {
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD',
    virtual_account: 'Virtual Account'
};

const ADAPTER_DEFAULTS: Record<string, { baseUrl: string; channels: ('card' | 'bank_transfer' | 'ussd' | 'virtual_account')[] }> = {
    paystack: {
        baseUrl: 'https://api.paystack.co',
        channels: ['card', 'bank_transfer', 'ussd']
    },
    monnify: {
        baseUrl: 'https://sandbox.monnify.com',
        channels: ['card', 'bank_transfer', 'virtual_account']
    },
    flutterwave: {
        baseUrl: 'https://api.flutterwave.com/v3',
        channels: ['card', 'bank_transfer', 'ussd']
    }
};

const AdminPaymentGatewaysPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'gateways' | 'reconciliation'>('gateways');
    const [loading, setLoading] = useState(true);
    const [gateways, setGateways] = useState<PaymentGatewayItem[]>([]);
    const [reconciliations, setReconciliations] = useState<ReconciliationTransaction[]>([]);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayItem | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formAdapterType, setFormAdapterType] = useState<'paystack' | 'monnify' | 'flutterwave'>('paystack');
    const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'maintenance'>('inactive');
    const [formEnvironment, setFormEnvironment] = useState<'test' | 'live'>('test');
    const [formIsDefault, setFormIsDefault] = useState(false);
    const [formBaseUrl, setFormBaseUrl] = useState('');
    const [formPublicKey, setFormPublicKey] = useState('');
    const [formSecretKey, setFormSecretKey] = useState('');
    const [formWebhookSecret, setFormWebhookSecret] = useState('');
    const [formChannels, setFormChannels] = useState<string[]>(['card', 'bank_transfer']);
    const [formContractCode, setFormContractCode] = useState('');
    const [saving, setSaving] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {}
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [gwRes, recRes] = await Promise.all([
                getPaymentGateways(),
                getReconciliationTransactions()
            ]);
            if (gwRes.success) setGateways(gwRes.data || []);
            if (recRes.success) setReconciliations(recRes.data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load payment gateway data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTestConnection = async (gateway: PaymentGatewayItem) => {
        try {
            setTestingId(gateway._id);
            const res = await testGatewayConnection(gateway._id);
            if (res.success) {
                toast.success(res.message || `Connection to ${gateway.name} succeeded!`);
            } else {
                toast.error(res.message || `Connection to ${gateway.name} failed`);
            }
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
            title: `Set ${gateway.name} as Primary Default?`,
            message: `This will make ${gateway.name} the platform default fallback when clients do not explicitly choose another gateway. The current default will be replaced safely.`,
            type: 'info',
            onConfirm: async () => {
                try {
                    setActionLoadingId(gateway._id);
                    const res = await setDefaultGateway(gateway._id);
                    if (res.success) {
                        toast.success(`${gateway.name} is now the default payment gateway`);
                        fetchData();
                    }
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
                ? 'Warning: New wallet funding transactions will no longer be initialized through this gateway. Existing transactions will retain their original gateway binding.'
                : `Activating ${gateway.name} will allow users to fund wallets through its enabled channels. Other active gateways remain active simultaneously.`,
            type: isDeactivating ? 'warning' : 'info',
            onConfirm: async () => {
                try {
                    setActionLoadingId(gateway._id);
                    const res = await updateGatewayStatus(gateway._id, nextStatus);
                    if (res.success) {
                        toast.success(`${gateway.name} status updated to ${nextStatus.toUpperCase()}`);
                        fetchData();
                    }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || error.message || 'Failed to update status');
                } finally {
                    setActionLoadingId(null);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

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
            setFormPublicKey(gateway.publicKey || '');
            setFormSecretKey(''); // Always start blank
            setFormWebhookSecret(''); // Always start blank
            setFormChannels(gateway.supportedChannels || []);
            setFormContractCode(gateway.metadata?.contractCode || '');
        } else {
            setSelectedGateway(null);
            setFormName('');
            setFormCode('');
            setFormAdapterType('paystack');
            setFormStatus('inactive');
            setFormEnvironment('test');
            setFormIsDefault(false);
            setFormBaseUrl(ADAPTER_DEFAULTS.paystack.baseUrl);
            setFormPublicKey('');
            setFormSecretKey('');
            setFormWebhookSecret('');
            setFormChannels(ADAPTER_DEFAULTS.paystack.channels);
            setFormContractCode('');
        }
        setIsEditModalOpen(true);
    };

    const handleAdapterChange = (adapter: 'paystack' | 'monnify' | 'flutterwave') => {
        setFormAdapterType(adapter);
        const defaults = ADAPTER_DEFAULTS[adapter];
        if (defaults && !selectedGateway) {
            setFormBaseUrl(defaults.baseUrl);
            setFormChannels(defaults.channels);
        }
    };

    const handleChannelToggle = (channel: string) => {
        setFormChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check if switching to LIVE
        if (formEnvironment === 'live' && (!selectedGateway || selectedGateway.environment !== 'live')) {
            const confirmed = window.confirm(
                `CONFIRMATION REQUIRED:\nYou are setting ${formName || 'this gateway'} to LIVE mode.\nReal money payments will be debited from customers using production credentials.\n\nDo you wish to proceed?`
            );
            if (!confirmed) return;
        }

        try {
            setSaving(true);
            const payload: any = {
                name: formName.trim(),
                adapterType: formAdapterType,
                status: formStatus,
                environment: formEnvironment,
                isDefault: formIsDefault,
                baseUrl: formBaseUrl.trim(),
                publicKey: formPublicKey.trim(),
                supportedChannels: formChannels,
                metadata: formAdapterType === 'monnify' ? { contractCode: formContractCode.trim() } : {}
            };

            // Only send secret keys if non-empty
            if (formSecretKey.trim() !== '') {
                payload.secretKey = formSecretKey.trim();
            }
            if (formWebhookSecret.trim() !== '') {
                payload.webhookSecret = formWebhookSecret.trim();
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

    const activeCount = gateways.filter(g => g.status === 'active').length;
    const defaultGateway = gateways.find(g => g.isDefault);
    const issuesCount = reconciliations.length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Payment Gateways</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Multi-gateway orchestration, encrypted credential storage & transaction reconciliation
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

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Gateways</div>
                        <div className="text-xl font-black text-slate-900">{gateways.length}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Gateways</div>
                        <div className="text-xl font-black text-emerald-600">{activeCount} Concurrent</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Radio className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Fallback</div>
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
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reconciliation Issues</div>
                        <div className={`text-xl font-black ${issuesCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                            {issuesCount} In-Flight
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => setActiveTab('gateways')}
                    className={`pb-3 text-xs font-bold tracking-tight transition-all flex items-center gap-2 relative ${
                        activeTab === 'gateways'
                            ? 'text-brand-emerald border-b-2 border-brand-emerald'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Gateways ({gateways.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('reconciliation')}
                    className={`pb-3 text-xs font-bold tracking-tight transition-all flex items-center gap-2 relative ${
                        activeTab === 'reconciliation'
                            ? 'text-brand-emerald border-b-2 border-brand-emerald'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reconciliation & In-Flight</span>
                    {issuesCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white">
                            {issuesCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab 1: Payment Gateways List */}
            {activeTab === 'gateways' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gateways.map(gw => {
                        const isTesting = testingId === gw._id;
                        const isActionBusy = actionLoadingId === gw._id;
                        const healthStatus = gw.lastHealthCheck?.status || 'unknown';

                        return (
                            <div
                                key={gw._id}
                                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${
                                    gw.isDefault
                                        ? 'border-brand-emerald/40 ring-1 ring-brand-emerald/20'
                                        : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 text-base">{gw.name}</h3>
                                                {gw.isDefault && (
                                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md tracking-wider uppercase">
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400">code: {gw.code}</div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {/* Status Badge */}
                                            <span
                                                className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                                    gw.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : gw.status === 'maintenance'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                            >
                                                {gw.status}
                                            </span>

                                            {/* Environment Badge */}
                                            <span
                                                className={`px-2 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                                                    gw.environment === 'live'
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                                                }`}
                                            >
                                                {gw.environment}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Channels */}
                                    <div className="mb-4">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Supported Channels
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {gw.supportedChannels && gw.supportedChannels.length > 0 ? (
                                                gw.supportedChannels.map(ch => (
                                                    <span
                                                        key={ch}
                                                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                                                    >
                                                        {CHANNEL_LABELS[ch] || ch}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">No channels enabled</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Security & Credentials (Boolean Indicators Only) */}
                                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Lock className="w-3 h-3 text-slate-500" />
                                            <span>Credential Security</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                {gw.secretKeyConfigured ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                                )}
                                                <div>
                                                    <div className="text-[10px] text-slate-500">Secret Key</div>
                                                    <div className="font-bold text-[11px] text-slate-800">
                                                        {gw.secretKeyConfigured ? 'Configured' : 'Missing'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {gw.webhookSecretConfigured ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                                )}
                                                <div>
                                                    <div className="text-[10px] text-slate-500">Webhook Secret</div>
                                                    <div className="font-bold text-[11px] text-slate-800">
                                                        {gw.webhookSecretConfigured ? 'Configured' : 'Missing'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Status */}
                                    <div className="mb-5 flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    healthStatus === 'online'
                                                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                                                        : healthStatus === 'offline'
                                                        ? 'bg-rose-500 ring-4 ring-rose-100'
                                                        : 'bg-slate-400'
                                                }`}
                                            />
                                            <div>
                                                <div className="font-bold text-slate-800 capitalize text-[11px]">
                                                    Health: {healthStatus}
                                                </div>
                                                {gw.lastHealthCheck?.checkedAt && (
                                                    <div className="text-[10px] text-slate-400">
                                                        Checked {new Date(gw.lastHealthCheck.checkedAt).toLocaleTimeString()}
                                                    </div>
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

                                {/* Card Actions */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(gw)}
                                            disabled={isActionBusy}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                                                gw.status === 'active'
                                                    ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                            }`}
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

            {/* Tab 2: Reconciliation & In-Flight Transactions */}
            {activeTab === 'reconciliation' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Funding Reconciliation & In-Flight Audit</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Monitored transactions in <span className="font-bold text-amber-700">processing</span> (interrupted finalization locks) or <span className="font-bold text-rose-700">reconciliation_required</span> (amount/currency mismatches).
                            </p>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl">
                            {reconciliations.length} Total Monitored
                        </span>
                    </div>

                    {/* Financial Safety Notice */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-3 text-xs">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold">Financial Integrity Rule</div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                                In-flight <span className="font-mono font-bold">processing</span> locks prevent duplicate crediting across webhook retries.
                                To prevent unverified financial liabilities, direct manual credit buttons without audited bank-statement verification are restricted in this phase.
                            </div>
                        </div>
                    </div>

                    {reconciliations.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-slate-800 text-sm">All Transactions Reconciled</div>
                            <div className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                No wallet funding transactions are stuck in processing or require manual investigation.
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                        <th className="pb-3">Reference</th>
                                        <th className="pb-3">Gateway</th>
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3">Expected Amount</th>
                                        <th className="pb-3">Confirmed Amount</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Elapsed / Issue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reconciliations.map(tx => (
                                        <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 font-mono font-bold text-slate-900">
                                                {tx.reference}
                                                {tx.confirmedProviderRef && (
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        ref: {tx.confirmedProviderRef}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 capitalize font-semibold text-slate-700">
                                                {tx.gateway}
                                            </td>
                                            <td className="py-3.5">
                                                <div className="font-bold text-slate-800">{tx.user?.name || 'Customer'}</div>
                                                <div className="text-[10px] text-slate-400">{tx.user?.email || tx.user?.phone || 'No contact'}</div>
                                            </td>
                                            <td className="py-3.5 font-bold text-slate-900">
                                                ₦{Number(tx.expectedAmount || 0).toLocaleString()}
                                                <span className="text-[10px] text-slate-400 ml-1">{tx.expectedCurrency}</span>
                                            </td>
                                            <td className="py-3.5 font-bold">
                                                {tx.confirmedAmount !== null ? (
                                                    <span className={tx.confirmedAmount !== tx.expectedAmount ? 'text-rose-600' : 'text-slate-900'}>
                                                        ₦{Number(tx.confirmedAmount).toLocaleString()}
                                                        <span className="text-[10px] text-slate-400 ml-1">{tx.confirmedCurrency}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not Confirmed</span>
                                                )}
                                            </td>
                                            <td className="py-3.5">
                                                {tx.status === 'processing' ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                                        PROCESSING
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                                        RECONCILIATION REQUIRED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 max-w-xs">
                                                {tx.status === 'processing' ? (
                                                    <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                        <span>In flight for {tx.elapsedMinutes} mins</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-rose-700 font-medium text-[11px]">
                                                        {tx.reconciliationReason || 'Audit mismatch detected'}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Add / Edit Payment Gateway */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">
                                    {selectedGateway ? `Configure ${selectedGateway.name}` : 'Register New Payment Gateway'}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {selectedGateway ? 'Update parameters, credentials, or channels' : 'Register a new active payment gateway'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            {/* General Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Gateway Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        placeholder="e.g. Paystack Live"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Gateway Code</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!selectedGateway}
                                        value={formCode}
                                        onChange={e => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="e.g. paystack"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald focus:bg-white disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Adapter Engine</label>
                                    <select
                                        value={formAdapterType}
                                        onChange={e => handleAdapterChange(e.target.value as any)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald focus:bg-white capitalize"
                                    >
                                        <option value="paystack">Paystack</option>
                                        <option value="monnify">Monnify</option>
                                        <option value="flutterwave">Flutterwave</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status</label>
                                    <select
                                        value={formStatus}
                                        onChange={e => setFormStatus(e.target.value as any)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald focus:bg-white capitalize"
                                    >
                                        <option value="active">Active (Can receive payments)</option>
                                        <option value="inactive">Inactive (Disabled)</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            {/* Environment & Default */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Environment Mode</label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                            <input
                                                type="radio"
                                                name="env"
                                                value="test"
                                                checked={formEnvironment === 'test'}
                                                onChange={() => setFormEnvironment('test')}
                                                className="text-brand-emerald focus:ring-brand-emerald"
                                            />
                                            <span>TEST Mode</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-indigo-700">
                                            <input
                                                type="radio"
                                                name="env"
                                                value="live"
                                                checked={formEnvironment === 'live'}
                                                onChange={() => setFormEnvironment('live')}
                                                className="text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <span>LIVE Production</span>
                                        </label>
                                    </div>
                                    {formEnvironment === 'live' && (
                                        <p className="text-[10px] text-amber-700 font-semibold mt-1">
                                            ⚠️ Live mode debits actual customer bank/card balances.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Default Gateway</label>
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer mt-2">
                                        <input
                                            type="checkbox"
                                            checked={formIsDefault}
                                            onChange={e => setFormIsDefault(e.target.checked)}
                                            className="rounded text-brand-emerald focus:ring-brand-emerald"
                                        />
                                        <span>Use as platform default fallback</span>
                                    </label>
                                </div>
                            </div>

                            {/* Base URL */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Base API URL</label>
                                <input
                                    type="text"
                                    value={formBaseUrl}
                                    onChange={e => setFormBaseUrl(e.target.value)}
                                    placeholder="https://api.paystack.co"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald focus:bg-white"
                                />
                            </div>

                            {/* Supported Channels */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Supported Channels</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.entries(CHANNEL_LABELS).map(([ch, label]) => (
                                        <label
                                            key={ch}
                                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                                formChannels.includes(ch)
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                    : 'bg-white border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formChannels.includes(ch)}
                                                onChange={() => handleChannelToggle(ch)}
                                                className="rounded text-brand-emerald focus:ring-brand-emerald"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Credentials Section */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                    <KeyRound className="w-4 h-4 text-brand-emerald" />
                                    <span>Encrypted Credentials</span>
                                </div>

                                {selectedGateway && (
                                    <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>
                                            Existing secrets are stored encrypted with AES-256-GCM. Leave the Secret Key or Webhook Secret fields blank to keep current credentials intact.
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Public Key / Client ID {formAdapterType === 'monnify' ? '(API Key)' : ''}
                                    </label>
                                    <input
                                        type="text"
                                        value={formPublicKey}
                                        onChange={e => setFormPublicKey(e.target.value)}
                                        placeholder="pk_test_... or API Key"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700">Secret Key</label>
                                        {selectedGateway?.secretKeyConfigured && (
                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Configured
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={formSecretKey}
                                        onChange={e => setFormSecretKey(e.target.value)}
                                        placeholder={selectedGateway?.secretKeyConfigured ? '•••••••• (Leave blank to retain current secret)' : 'sk_test_... or Secret Key'}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700">Webhook Secret / Hash</label>
                                        {selectedGateway?.webhookSecretConfigured && (
                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Configured
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={formWebhookSecret}
                                        onChange={e => setFormWebhookSecret(e.target.value)}
                                        placeholder={selectedGateway?.webhookSecretConfigured ? '•••••••• (Leave blank to retain current webhook secret)' : 'Webhook signature hash/secret'}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald"
                                    />
                                </div>

                                {/* Monnify Specific Metadata */}
                                {formAdapterType === 'monnify' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Contract Code</label>
                                        <input
                                            type="text"
                                            value={formContractCode}
                                            onChange={e => setFormContractCode(e.target.value)}
                                            placeholder="Monnify Contract Code (e.g. 1234567890)"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-emerald"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-brand-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{selectedGateway ? 'Save Configuration' : 'Create Gateway'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog Modal */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${
                                confirmDialog.type === 'danger'
                                    ? 'bg-rose-50 text-rose-600'
                                    : confirmDialog.type === 'warning'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">{confirmDialog.title}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{confirmDialog.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="px-5 py-2 bg-brand-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
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
