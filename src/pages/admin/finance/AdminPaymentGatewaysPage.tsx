import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    replaceMonnifyMerchant,
    testMonnifyHostedCheckout,
    enableMonnifyCustomerFunding,
    recoverMonnifyGatewayTest,
    isValidMonnifyGatewayTestRecoverySuccess,
    getReconciliationTransactions,
    getAdapterCapabilities,
} from '../../../services/admin/adminPaymentGatewayService';
import { toast } from 'react-hot-toast';
import { isTrustedHostedCheckoutUrl } from '../../../utils/hostedCheckout';
import { useAuthStore } from '../../../store/auth/authStore';

// ═══════════════════════════════════════════════════════════════════════════════
// PILOT FORM STYLE SYSTEM  ─  Payment Gateway modal
// Theme-aware fintech tokens (light default + dark: variants). Follows the
// Zantara ThemeContext (class-based .dark on <html>, darkMode: 'class') and the
// CSS-variable slate scale in src/styles/index.css: in light mode slate-900 is a
// dark navy ink and slate-300 is a light border; in dark mode the same classes
// invert via the variables. dark: variants are used where the token must keep the
// approved dark-navy look verbatim (surfaces, carets, autofill, color-scheme).
// ═══════════════════════════════════════════════════════════════════════════════

// Shared by all form controls. Light: white field, navy ink, dark caret, light
// color-scheme and a white WebKit autofill backdrop. Dark: pinned to the current
// high-contrast navy field (slate-900/70), slate-100 ink, indigo caret, dark
// color-scheme and navy autofill backdrop. Focus keeps a fixed 2px ring in both
// themes so nothing shifts on focus.
const formControlBase =
    'w-full rounded-xl border border-slate-300 bg-white text-slate-900 ' +
    'placeholder:text-slate-500 caret-slate-900 [color-scheme:light] ' +
    '[-webkit-box-shadow:inset_0_0_0_1000px_#ffffff] [-webkit-text-fill-color:#0f172a] ' +
    'transition-colors duration-150 hover:border-slate-400 ' +
    'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ' +
    'dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 ' +
    'dark:placeholder:text-slate-500 dark:caret-indigo-300 dark:[color-scheme:dark] ' +
    'dark:[-webkit-box-shadow:inset_0_0_0_1000px_#0f172a] dark:[-webkit-text-fill-color:#e2e8f0] ' +
    'dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

const formInputClass = `${formControlBase} px-4 py-3 text-sm font-medium`;
const formMonoInputClass = `${formControlBase} px-4 py-3 text-sm font-mono tracking-tight`;
const formInputWithIconClass = `${formControlBase} pl-11 pr-4 py-3 text-sm font-medium`;
const formSelectClass = `${formControlBase} appearance-none px-4 py-3 pr-10 text-sm font-medium [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-200`;
const formLabelClass = 'flex items-center justify-between gap-2 mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300';
const formHintClass = 'mt-1.5 text-xs text-slate-500 dark:text-slate-400';
const formSectionTitleClass = 'flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4';
const modalButtonPrimaryClass =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-emerald text-white text-sm font-bold ' +
    'px-7 py-2.5 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-95 transition-all ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';
const modalButtonSecondaryClass =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 ' +
    'text-sm font-semibold px-5 py-2.5 hover:bg-slate-200 hover:text-slate-900 active:scale-95 transition-all ' +
    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white';
const modalIconButtonClass =
    'w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 ' +
    'text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all shrink-0 ' +
    'dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100';
const formDisabledClass =
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:hover:border-slate-300 ' +
    'dark:disabled:bg-slate-900/40 dark:disabled:hover:border-slate-700';
const formIconClass = 'text-slate-500 dark:text-slate-400';

// ─── Adapter capabilities ────────────────────────────────────────────────────
// The list of available adapter engines is NOT hardcoded here. It is fetched
// from GET /admin/payment-gateways/capabilities, which is derived exclusively
// from the backend adapter registry (adapters/payment/paymentAdapterRegistry.js).
// The backend registry is the single source of truth for supported gateways.
// If capabilities cannot be loaded, a controlled error/retry state is shown —
// there is intentionally NO local fallback duplicate of the adapter registry.

const CHANNEL_DISPLAY: Record<string, string> = {
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD',
    virtual_account: 'Virtual Account',
};

const MONNIFY_API_BASES = {
    test: 'https://sandbox.monnify.com',
    live: 'https://api.monnify.com',
} as const;

const MONNIFY_CHECKOUT_HOSTS = {
    test: 'sandbox.sdk.monnify.com',
    live: 'sdk.monnify.com',
} as const;

// ─── Helper: slugify display name into a safe gateway code ───────────────────
function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// ─── Section header component for consistent style ───────────────────────────
const SectionLabel: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
    <p className={formSectionTitleClass}>
        <span className={`w-1.5 h-1.5 rounded-full ${color} inline-block shrink-0`} />
        {children}
    </p>
);

// ─── Label component ─────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; htmlFor?: string; extra?: React.ReactNode }> = ({ children, htmlFor, extra }) => (
    <label htmlFor={htmlFor} className={formLabelClass}>
        <span>{children}</span>
        {extra}
    </label>
);

const emptyReplacementCredentials = () => ({
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    contractCode: '',
    environment: 'test' as 'test' | 'live',
    currentPassword: '',
    confirmed: false,
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPaymentGatewaysPage: React.FC = () => {
    const currentAdminId = useAuthStore(state => String(state.user?.id || state.user?._id || ''));
    const [activeTab, setActiveTab] = useState<'gateways' | 'reconciliation'>('gateways');
    const [loading, setLoading] = useState(true);
    const [gateways, setGateways] = useState<PaymentGatewayItem[]>([]);
    const [reconciliations, setReconciliations] = useState<ReconciliationTransaction[]>([]);
    const [capabilities, setCapabilities] = useState<AdapterCapability[]>([]);
    const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [checkoutClock, setCheckoutClock] = useState(Date.now());
    const fetchRequestId = useRef(0);

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
    const [formPriority, setFormPriority] = useState<number>(1);
    const [formBaseUrl, setFormBaseUrl] = useState('');
    const [formChannels, setFormChannels] = useState<string[]>([]);
    const [formMetadata, setFormMetadata] = useState<Record<string, string>>({});
    // Credential fields: keyed by field.key (publicKey / secretKey / webhookSecret)
    const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const [replacementGateway, setReplacementGateway] = useState<PaymentGatewayItem | null>(null);
    const [replacementCredentials, setReplacementCredentials] = useState(emptyReplacementCredentials);
    const [replacementSaving, setReplacementSaving] = useState(false);
    const [checkoutGateway, setCheckoutGateway] = useState<PaymentGatewayItem | null>(null);
    const [checkoutAmount, setCheckoutAmount] = useState('100');
    const [checkoutPassword, setCheckoutPassword] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [checkoutReference, setCheckoutReference] = useState('');
    const [checkoutPending, setCheckoutPending] = useState(false);
    const [checkoutStarting, setCheckoutStarting] = useState(false);
    const [checkoutLiveConfirmed, setCheckoutLiveConfirmed] = useState(false);
    const [eligibilityGateway, setEligibilityGateway] = useState<PaymentGatewayItem | null>(null);
    const [eligibilityPassword, setEligibilityPassword] = useState('');
    const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
    const [eligibilitySaving, setEligibilitySaving] = useState(false);
    const [eligibilityPendingMessage, setEligibilityPendingMessage] = useState('');
    const [recoveryTarget, setRecoveryTarget] = useState<{
        transaction: ReconciliationTransaction;
        gateway: PaymentGatewayItem;
    } | null>(null);
    const [recoveryPassword, setRecoveryPassword] = useState('');
    const [recoveryNote, setRecoveryNote] = useState('');
    const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
    const [recoverySaving, setRecoverySaving] = useState(false);
    const [recoveryMessage, setRecoveryMessage] = useState('');

    // Confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

    // ─── Derived: current adapter spec ──────────────────────────────────────
    const currentSpec = capabilities.find(c => c.code === formAdapterType) ?? null;
    const formIsCanonicalMonnify = formCode === 'monnify' && formAdapterType === 'monnify';
    const selectedMonnifyActivationBlocked = Boolean(
        formIsCanonicalMonnify &&
        (!selectedGateway ||
            selectedGateway.metadata?.administrativeSandboxOnly ||
            selectedGateway.metadata?.customerFundingEligibility?.status !== 'eligible')
    );

    useEffect(() => {
        if (!selectedGateway && formIsCanonicalMonnify) {
            setFormStatus('inactive');
            setFormIsDefault(false);
        }
    }, [selectedGateway, formIsCanonicalMonnify]);

    // ─── Data fetching ───────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        const requestId = ++fetchRequestId.current;
        let gatewaysLoaded = false;
        try {
            setLoading(true);
            const [gwRes, recRes, capRes] = await Promise.allSettled([
                getPaymentGateways(),
                getReconciliationTransactions(),
                getAdapterCapabilities(),
            ]);
            if (requestId !== fetchRequestId.current) return false;
            if (gwRes.status === 'fulfilled' && gwRes.value.success) {
                setGateways(gwRes.value.data || []);
                gatewaysLoaded = true;
            } else {
                setGateways([]);
            }
            if (recRes.status === 'fulfilled' && recRes.value.success) {
                setReconciliations(recRes.value.data || []);
            } else {
                setReconciliations([]);
            }
            if (capRes.status === 'fulfilled' && capRes.value.success && capRes.value.data?.length) {
                setCapabilities(capRes.value.data);
                setCapabilitiesError(null);
            } else {
                // Backend registry is the single source of truth — no local fallback.
                setCapabilitiesError('Adapter capabilities could not be loaded from the backend registry.');
            }
        } catch (error: any) {
            if (requestId === fetchRequestId.current) {
                setGateways([]);
                setCapabilitiesError('Adapter capabilities could not be loaded from the backend registry.');
                toast.error(error.message || 'Failed to load payment gateway data');
            }
        } finally {
            if (requestId === fetchRequestId.current) setLoading(false);
        }
        return gatewaysLoaded;
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        setCheckoutClock(Date.now());
    }, [gateways]);

    useEffect(() => {
        const now = Date.now();
        const nextExpiry = Math.min(
            ...gateways
                .map(gateway => Date.parse(gateway.metadata?.checkoutValidation?.expiresAt || ''))
                .filter(expiry => Number.isFinite(expiry) && expiry > now),
        );
        if (!Number.isFinite(nextExpiry)) return;
        const timer = window.setTimeout(
            () => setCheckoutClock(Date.now()),
            Math.max(0, nextExpiry - now + 50),
        );
        return () => window.clearTimeout(timer);
    }, [gateways, checkoutClock]);

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
        if (
            gateway.code === 'monnify' &&
            gateway.adapterType === 'monnify' &&
            (gateway.metadata?.administrativeSandboxOnly || gateway.metadata?.customerFundingEligibility?.status !== 'eligible')
        ) {
            toast.error('Complete Monnify customer-funding eligibility and activate the gateway before making it default.');
            return;
        }
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
        const isCanonicalMonnify = gateway.code === 'monnify' && gateway.adapterType === 'monnify';
        if (!isDeactivating && isCanonicalMonnify && (
            gateway.metadata?.administrativeSandboxOnly ||
            gateway.metadata?.customerFundingEligibility?.status !== 'eligible'
        )) {
            toast.error('Complete paid checkout validation and customer-funding eligibility before activation.');
            return;
        }
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

    const openMerchantReplacement = (gateway: PaymentGatewayItem) => {
        setReplacementGateway(gateway);
        setReplacementCredentials({
            ...emptyReplacementCredentials(),
            environment: gateway.environment,
        });
    };

    const closeMerchantReplacement = () => {
        if (replacementSaving) return;
        setReplacementGateway(null);
        setReplacementCredentials(emptyReplacementCredentials());
    };

    const handleMerchantReplacement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replacementGateway) return;
        if (!replacementCredentials.confirmed) {
            toast.error('Confirm the intentional Monnify merchant replacement before continuing');
            return;
        }
        try {
            setReplacementSaving(true);
            await replaceMonnifyMerchant(replacementGateway._id, {
                publicKey: replacementCredentials.publicKey.trim(),
                secretKey: replacementCredentials.secretKey.trim(),
                webhookSecret: replacementCredentials.webhookSecret.trim() || undefined,
                contractCode: replacementCredentials.contractCode.trim(),
                environment: replacementCredentials.environment,
                baseUrl: MONNIFY_API_BASES[replacementCredentials.environment],
                currentPassword: replacementCredentials.currentPassword,
                confirmation: replacementCredentials.environment === 'live'
                    ? 'replace-monnify-live-merchant'
                    : 'replace-monnify-merchant',
            });
            toast.success('Monnify merchant replaced. It remains inactive and admin-isolated until paid validation and eligibility approval are complete.');
            setReplacementGateway(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Merchant replacement failed');
        } finally {
            setReplacementCredentials(emptyReplacementCredentials());
            setReplacementSaving(false);
        }
    };

    const openCheckoutTest = (gateway: PaymentGatewayItem) => {
        setCheckoutGateway(gateway);
        setCheckoutAmount('100');
        setCheckoutPassword('');
        setCheckoutUrl('');
        setCheckoutReference('');
        setCheckoutPending(false);
        setCheckoutLiveConfirmed(false);
    };

    const closeCheckoutTest = () => {
        if (checkoutStarting) return;
        setCheckoutGateway(null);
        setCheckoutAmount('100');
        setCheckoutPassword('');
        setCheckoutUrl('');
        setCheckoutReference('');
        setCheckoutPending(false);
        setCheckoutLiveConfirmed(false);
    };

    const handleCheckoutTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutGateway) return;
        if (checkoutGateway.environment === 'live' && !checkoutLiveConfirmed) {
            toast.error('Confirm the live paid validation checkout before continuing.');
            return;
        }
        try {
            setCheckoutStarting(true);
            const result = await testMonnifyHostedCheckout(checkoutGateway._id, {
                amount: Number(checkoutAmount),
                currentPassword: checkoutPassword,
                ...(checkoutGateway.environment === 'live'
                    ? { confirmation: 'initialize-monnify-live-validation-checkout' as const }
                    : {}),
            });
            if (result.httpStatus === 202 || result.code === 'PAYMENT_INITIALIZATION_AMBIGUOUS') {
                setCheckoutUrl('');
                setCheckoutReference(result.reference || 'Unavailable');
                setCheckoutPending(true);
                toast(result.message || 'Checkout initialization is pending. Do not retry this reference.');
                fetchData();
                return;
            }
            const checkoutHost = MONNIFY_CHECKOUT_HOSTS[checkoutGateway.environment];
            if (
                result.environment !== checkoutGateway.environment ||
                !isTrustedHostedCheckoutUrl(result.authorizationUrl || '', 'monnify', checkoutHost)
            ) {
                setCheckoutUrl('');
                setCheckoutReference(result.reference || 'Unavailable');
                setCheckoutPending(true);
                toast.error('Checkout was initialized with an unsafe response. Do not retry; reconcile this reference.');
                return;
            }
            setCheckoutUrl(result.authorizationUrl || '');
            setCheckoutReference(result.reference || '');
            setCheckoutPending(false);
            toast.success(`${checkoutGateway.environment.toUpperCase()} validation checkout initialized`);
            fetchData();
        } catch (error: any) {
            const failure = error.response?.data;
            if (failure?.reference && ['PAYMENT_INITIALIZATION_AMBIGUOUS', 'MONNIFY_VALIDATION_CHECKOUT_CONFIGURATION_CHANGED'].includes(failure.code)) {
                setCheckoutUrl('');
                setCheckoutReference(failure.reference);
                setCheckoutPending(true);
                toast(failure.message || 'Checkout initialization is pending. Do not retry this reference.');
                fetchData();
            } else if (!error.response) {
                setCheckoutUrl('');
                setCheckoutReference('Unavailable');
                setCheckoutPending(true);
                toast.error('The checkout response was lost. Do not retry until the attempt is reconciled.');
            } else {
                toast.error(failure?.message || error.message || 'Monnify validation checkout failed');
            }
        } finally {
            setCheckoutPassword('');
            setCheckoutStarting(false);
        }
    };

    const openEligibilityReview = (gateway: PaymentGatewayItem) => {
        setEligibilityGateway(gateway);
        setEligibilityPassword('');
        setEligibilityConfirmed(false);
        setEligibilityPendingMessage('');
    };

    const closeEligibilityReview = () => {
        if (eligibilitySaving) return;
        setEligibilityGateway(null);
        setEligibilityPassword('');
        setEligibilityConfirmed(false);
        setEligibilityPendingMessage('');
    };

    const handleEligibilityReview = async (e: React.FormEvent) => {
        e.preventDefault();
        const reference = eligibilityGateway?.metadata?.checkoutValidation?.reference;
        if (!eligibilityGateway || !reference) return;
        if (!eligibilityConfirmed) {
            toast.error('Confirm the customer-funding eligibility check before continuing.');
            return;
        }
        try {
            setEligibilitySaving(true);
            setEligibilityPendingMessage('');
            const result = await enableMonnifyCustomerFunding(eligibilityGateway._id, {
                reference,
                currentPassword: eligibilityPassword,
                confirmation: eligibilityGateway.environment === 'live'
                    ? 'enable-monnify-live-customer-funding'
                    : 'enable-monnify-test-customer-funding',
            });
            if (result.httpStatus === 202) {
                const message = result.message || 'Monnify has not conclusively verified the validation payment.';
                setEligibilityPendingMessage(`${message} Do not retry automatically; check again manually later.`);
                toast(message);
                return;
            }
            if (result.success !== true || (result.status && result.status !== 'success')) {
                toast.error(result.message || 'Monnify did not confirm customer-funding eligibility.');
                await fetchData();
                return;
            }
            toast.success('Customer funding is eligible. The gateway remains inactive; activate it separately when ready.');
            setEligibilityGateway(null);
            setGateways([]);
            const refreshed = await fetchData();
            if (!refreshed) {
                toast.error('Customer funding was enabled, but the gateway could not be refreshed. Reload this page before continuing.');
            }
        } catch (error: any) {
            const failure = error.response?.data;
            if (failure?.refreshRequired === true) {
                setEligibilityGateway(null);
                setEligibilityConfirmed(false);
                setEligibilityPendingMessage('');
                setGateways([]);
                const refreshed = await fetchData();
                toast.error(refreshed
                    ? (failure.message || 'The validation state changed. Review the refreshed gateway before continuing.')
                    : 'The validation state changed, but the gateway could not be refreshed. Reload this page before continuing.');
                return;
            }
            if (
                failure?.attemptReleased === true &&
                failure?.retryAllowed === true &&
                ['FAILED', 'EXPIRED'].includes(failure.providerStatus)
            ) {
                toast(`${failure.providerStatus} validation attempt retained. A new ${eligibilityGateway.environment.toUpperCase()} checkout may now be started explicitly.`);
                setEligibilityGateway(null);
                setEligibilityConfirmed(false);
                setEligibilityPendingMessage('');
                setGateways([]);
                const refreshed = await fetchData();
                if (!refreshed) {
                    toast.error('The attempt was released, but the gateway could not be refreshed. Reload this page before starting another checkout.');
                }
                return;
            }
            toast.error(failure?.message || error.message || 'Customer-funding eligibility check failed');
        } finally {
            setEligibilityPassword('');
            setEligibilitySaving(false);
        }
    };

    const recoveryGatewayFor = (transaction: ReconciliationTransaction) =>
        gateways.find(candidate => candidate._id === transaction.gatewayId);

    const isRecoveryActionAvailable = (transaction: ReconciliationTransaction) => {
        const gateway = recoveryGatewayFor(transaction);
        return Boolean(
            transaction.recoveryAvailable &&
            transaction.status === 'reconciliation_required' &&
            transaction.type === 'gateway_test' &&
            transaction.gateway === 'monnify' &&
            transaction.user?._id === currentAdminId &&
            gateway?.code === 'monnify' &&
            gateway.adapterType === 'monnify' &&
            gateway.environment === 'test' &&
            gateway.baseUrl === MONNIFY_API_BASES.test &&
            gateway.status === 'inactive' &&
            !gateway.isDefault &&
            gateway.metadata?.administrativeSandboxOnly === true
        );
    };

    const openGatewayTestRecovery = (transaction: ReconciliationTransaction) => {
        const gateway = recoveryGatewayFor(transaction);
        if (
            !isRecoveryActionAvailable(transaction) ||
            !gateway
        ) {
            toast.error('This manual-review transaction is not eligible for Monnify gateway-test recovery.');
            return;
        }
        setRecoveryTarget({ transaction, gateway });
        setRecoveryPassword('');
        setRecoveryNote('');
        setRecoveryConfirmed(false);
        setRecoveryMessage('');
    };

    const closeGatewayTestRecovery = () => {
        if (recoverySaving) return;
        setRecoveryTarget(null);
        setRecoveryPassword('');
        setRecoveryNote('');
        setRecoveryConfirmed(false);
        setRecoveryMessage('');
    };

    const handleGatewayTestRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recoveryTarget || !recoveryConfirmed) return;
        try {
            setRecoverySaving(true);
            setRecoveryMessage('');
            const result = await recoverMonnifyGatewayTest(recoveryTarget.gateway._id, {
                reference: recoveryTarget.transaction.reference,
                currentPassword: recoveryPassword,
                confirmation: 'recover-monnify-test-gateway-payment',
                ...(recoveryNote.trim() ? { note: recoveryNote.trim() } : {}),
            });
            if (result.httpStatus === 202 || result.status === 'processing') {
                if (
                    result.httpStatus !== 202 ||
                    result.success !== false ||
                    result.code !== 'MONNIFY_GATEWAY_TEST_RECOVERY_IN_PROGRESS' ||
                    result.status !== 'processing' ||
                    result.reference !== recoveryTarget.transaction.reference ||
                    result.recovered !== false ||
                    result.credited !== false ||
                    result.retryAllowed !== true
                ) {
                    toast.error('The recovery status response could not be safely matched to this payment.');
                    setRecoveryTarget(null);
                    setRecoveryNote('');
                    setRecoveryConfirmed(false);
                    setRecoveryMessage('');
                    setReconciliations([]);
                    await fetchData();
                    return;
                }
                const message = result.message || 'Recovery verification is already in progress.';
                setRecoveryMessage(message);
                toast(message);
                return;
            }
            if (!isValidMonnifyGatewayTestRecoverySuccess(
                result,
                recoveryTarget.transaction.reference,
            )) {
                toast.error(result.message || 'The gateway-test payment was not safely recovered.');
                setRecoveryTarget(null);
                setRecoveryNote('');
                setRecoveryConfirmed(false);
                setRecoveryMessage('');
                setReconciliations([]);
                await fetchData();
                return;
            }
            toast.success(result.alreadyRecovered
                ? 'Payment was already recovered. Continue with Check Eligibility.'
                : 'Paid gateway test recovered without wallet credit. Continue with Check Eligibility.');
            setRecoveryTarget(null);
            setRecoveryConfirmed(false);
            setActiveTab('gateways');
            setGateways([]);
            await fetchData();
        } catch (error: any) {
            const failure = error.response?.data;
            if (failure?.refreshRequired === true) {
                setRecoveryTarget(null);
                setRecoveryConfirmed(false);
                setGateways([]);
                await fetchData();
                toast.error(failure.message || 'Recovery state changed. Review the refreshed gateway before retrying.');
                return;
            }
            toast.error(failure?.message || error.message || 'Monnify gateway-test recovery failed');
        } finally {
            setRecoveryPassword('');
            setRecoverySaving(false);
        }
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
            setFormPriority(gateway.priority ?? 1);
            setFormBaseUrl(gateway.baseUrl || '');
            setFormChannels(gateway.supportedChannels || []);
            setFormMetadata({ contractCode: gateway.metadata?.contractCode || '' });
            // Secret fields always start blank on edit
            setFormCredentials({ publicKey: gateway.publicKey || '', secretKey: '', webhookSecret: '' });
        } else {
            // No local fallback: the backend registry is the single source of truth.
            if (!capabilities.length) {
                toast.error('Adapter capabilities are unavailable. Retry loading the payment gateways page.');
                return;
            }
            const defaultSpec = capabilities.find(c => c.code === 'paystack') ?? capabilities[0];
            setSelectedGateway(null);
            setFormName('');
            setFormCode('');
            setFormAdapterType(defaultSpec.code);
            setFormStatus('inactive');
            setFormEnvironment('test');
            setFormIsDefault(false);
            setFormPriority(1);
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
        if (!currentSpec || !currentSpec.supportedChannels.includes(channel)) return;
        setFormChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    // ─── Default guard: if status is not active, cannot be default ───────────
    const handleStatusChange = (status: 'active' | 'inactive' | 'maintenance') => {
        if (status === 'active' && selectedMonnifyActivationBlocked) {
            toast.error('Complete paid checkout validation and customer-funding eligibility before activation.');
            return;
        }
        setFormStatus(status);
        if (status !== 'active') setFormIsDefault(false);
    };

    // ─── Form submit ─────────────────────────────────────────────────────────
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let confirmEnvironmentChange: 'create-live' | 'test-to-live' | undefined;
        if (formEnvironment === 'live' && (!selectedGateway || selectedGateway.environment !== 'live')) {
            const confirmed = window.confirm(
                `CONFIRMATION REQUIRED:\nYou are setting ${formName || 'this gateway'} to LIVE mode.\nReal money payments will be debited from customers using production credentials.\n\nDo you wish to proceed?`
            );
            if (!confirmed) return;
            confirmEnvironmentChange = selectedGateway ? 'test-to-live' : 'create-live';
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
                priority: Number(formPriority) || 1,
                baseUrl: formBaseUrl.trim(),
                publicKey: (formCredentials.publicKey || '').trim(),
                supportedChannels: formChannels,
                metadata: metadataPayload,
                ...(confirmEnvironmentChange ? { confirmEnvironmentChange } : {}),
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
                        disabled={!capabilities.length}
                        className="px-4 py-2 bg-brand-emerald text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-emerald disabled:active:scale-100"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Gateway</span>
                    </button>
                </div>
            </div>

            {/* Capabilities warning (backend registry unreachable → no local fallback) */}
            {capabilitiesError && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                            <strong>Adapter registry unavailable.</strong> {capabilitiesError} Adding or configuring new
                            gateways is disabled until capabilities load.
                        </span>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="shrink-0 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            )}

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
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-xs leading-relaxed">
                            Gateway records are retained permanently for transaction verification, webhook history, and reconciliation. Use <strong>Deactivate</strong> to archive a gateway from new customer payment routing; hard deletion is disabled.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gateways.map(gw => {
                        const isTesting = testingId === gw._id;
                        const isActionBusy = actionLoadingId === gw._id;
                        const healthStatus = gw.lastHealthCheck?.status || 'unknown';
                        const isCanonicalMonnify = gw.code === 'monnify' && gw.adapterType === 'monnify';
                        const isAdminIsolated = gw.metadata?.administrativeSandboxOnly === true;
                        const isCustomerEligible = gw.metadata?.customerFundingEligibility?.status === 'eligible';
                        const hasExactMonnifyBase = isCanonicalMonnify && gw.baseUrl === MONNIFY_API_BASES[gw.environment];
                        const checkoutEvidence = gw.metadata?.checkoutValidation;
                        const checkoutExpiresAt = checkoutEvidence?.expiresAt
                            ? Date.parse(checkoutEvidence.expiresAt)
                            : Number.NaN;
                        const checkoutEvidenceExpired = Number.isFinite(checkoutExpiresAt) && checkoutExpiresAt <= checkoutClock;
                        const checkoutEvidenceMatchesGateway = Boolean(
                            checkoutEvidence?.gatewayId === gw._id &&
                            checkoutEvidence?.environment === gw.environment
                        );
                        const checkoutRetryBlocked = Boolean(
                            checkoutEvidence && !checkoutEvidenceExpired
                        );
                        const canReviewEligibility = Boolean(
                            hasExactMonnifyBase && isAdminIsolated && gw.status === 'inactive' && !gw.isDefault &&
                            checkoutEvidenceMatchesGateway && checkoutEvidence?.reference && !checkoutEvidenceExpired &&
                            ['initialized', 'ambiguous'].includes(checkoutEvidence.status)
                        );
                        const monnifyActivationBlocked = isCanonicalMonnify && (isAdminIsolated || !isCustomerEligible);
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

                                    {isCanonicalMonnify && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {isAdminIsolated && (
                                                <span className="px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                    Admin Isolated
                                                </span>
                                            )}
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider border ${isCustomerEligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                                Customer Funding: {isCustomerEligible ? 'Eligible' : 'Ineligible'}
                                            </span>
                                            {checkoutEvidence?.status && (
                                                <span className="px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
                                                    Validation: {checkoutEvidenceExpired ? 'expired locally' : checkoutEvidence.status}
                                                </span>
                                            )}
                                        </div>
                                    )}

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

                                    {isCanonicalMonnify && (
                                        <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50/70 p-3 space-y-2 dark:border-violet-400/20 dark:bg-violet-500/10">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Privileged Monnify Lifecycle
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-violet-700/80 dark:text-violet-200/80">
                                                Validation is administrative and non-creditable. Customer funding stays unavailable while admin isolation is present.
                                            </p>
                                            {checkoutRetryBlocked ? (
                                                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-200">
                                                    This validation attempt is still protected. Use Check Eligibility for the same reference. A new checkout is allowed only after Monnify confirms FAILED or EXPIRED, or after the local evidence expires{checkoutEvidence?.expiresAt ? ` at ${new Date(checkoutEvidence.expiresAt).toLocaleString()}` : ''}.
                                                </p>
                                            ) : isAdminIsolated && checkoutEvidenceExpired ? (
                                                <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-200">
                                                    The previous validation evidence expired locally. Validate {gw.environment.toUpperCase()} can be used for a deliberate fresh checkout.
                                                </p>
                                            ) : isAdminIsolated && !checkoutEvidence ? (
                                                <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-200">
                                                    No validation attempt is active. Validate {gw.environment.toUpperCase()} can be used.
                                                </p>
                                            ) : null}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => openMerchantReplacement(gw)}
                                                    disabled={gw.status !== 'inactive' || gw.isDefault}
                                                    title={gw.status !== 'inactive' || gw.isDefault ? 'Deactivate Monnify and keep it non-default before replacement' : 'Replace the inactive Monnify merchant'}
                                                    className="px-3 py-2 text-[11px] font-bold rounded-lg border border-violet-300 bg-white text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed dark:border-violet-400/30 dark:bg-slate-900/70 dark:text-violet-200"
                                                >
                                                    Replace Merchant
                                                </button>
                                                <button
                                                    onClick={() => openCheckoutTest(gw)}
                                                    disabled={!hasExactMonnifyBase || !isAdminIsolated || gw.status !== 'inactive' || gw.isDefault || checkoutRetryBlocked}
                                                    title={checkoutRetryBlocked
                                                        ? 'The current attempt must be checked; only provider-confirmed FAILED or EXPIRED, or local evidence expiry, permits a fresh checkout'
                                                        : !hasExactMonnifyBase || !isAdminIsolated || gw.status !== 'inactive' || gw.isDefault
                                                            ? 'Requires the exact inactive, non-default, admin-isolated Monnify gateway'
                                                            : `Initialize an isolated ${gw.environment.toUpperCase()} validation checkout`}
                                                    className="px-3 py-2 text-[11px] font-bold rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {checkoutRetryBlocked ? `${gw.environment.toUpperCase()} Attempt Locked` : `Validate ${gw.environment.toUpperCase()}`}
                                                </button>
                                                {canReviewEligibility && (
                                                    <button
                                                        onClick={() => openEligibilityReview(gw)}
                                                        className="px-3 py-2 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                                                    >
                                                        Check Eligibility
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(gw)}
                                            disabled={isActionBusy || (gw.status !== 'active' && monnifyActivationBlocked)}
                                            title={gw.status !== 'active' && monnifyActivationBlocked ? 'Paid validation and customer-funding eligibility are required before activation' : undefined}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${gw.status === 'active' ? 'text-slate-600 bg-slate-100 hover:bg-slate-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                                        >
                                            {gw.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        {!gw.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(gw)}
                                                disabled={isActionBusy || gw.status !== 'active' || monnifyActivationBlocked}
                                                title={monnifyActivationBlocked ? 'Customer-funding eligibility and removal of admin isolation are required' : gw.status !== 'active' ? 'Gateway must be active to set as default' : 'Set as primary fallback default'}
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
                </div>
            )}

            {/* ── Tab 2: Reconciliation ── */}
            {activeTab === 'reconciliation' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Funding Reconciliation &amp; In-Flight Audit</h2>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Transactions in <span className="font-bold text-amber-700">processing</span>, <span className="font-bold text-sky-700">settlement_pending</span>, or <span className="font-bold text-rose-700">reconciliation_required</span> state.
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
                                        <th className="pb-3 text-right">Action</th>
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
                                                    : tx.status === 'settlement_pending'
                                                        ? <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">SETTLING</span>
                                                        : <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">RECONCILE</span>}
                                            </td>
                                            <td className="py-3.5 max-w-xs">
                                                {tx.status === 'reconciliation_required'
                                                    ? <div className="text-rose-700 font-medium text-[11px]">{tx.reconciliationReason || 'Audit mismatch'}</div>
                                                    : <div className="flex items-center gap-1.5 text-amber-700 font-medium"><Clock className="w-3.5 h-3.5 shrink-0" /><span>{tx.elapsedMinutes} mins in-flight</span></div>}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                {isRecoveryActionAvailable(tx) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openGatewayTestRecovery(tx)}
                                                        className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-700 transition-colors hover:bg-violet-100"
                                                    >
                                                        Recover Gateway Test
                                                    </button>
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

            {/* ══════════════════════════════════════════════════════════════
                MODAL: Add / Edit Payment Gateway
            ══════════════════════════════════════════════════════════════ */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 dark:bg-slate-950/80">
                    <div className="bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-[2rem] max-w-4xl w-full border border-slate-200 shadow-2xl shadow-black/50 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 dark:border-slate-800">

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-transparent shrink-0 rounded-t-[2rem] dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {selectedGateway ? `Edit: ${selectedGateway.name}` : 'Register New Payment Gateway'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
                                    {selectedGateway
                                        ? 'Update credentials, channels, and gateway settings.'
                                        : 'Configure a new payment gateway adapter for wallet funding.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                aria-label="Close dialog"
                                className={modalIconButtonClass}
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
                                                className={formInputClass}
                                            />
                                        </div>

                                        {/* Internal Code */}
                                        <div>
                                            <FieldLabel htmlFor="gw-code">
                                                Internal Code
                                                {selectedGateway && <span className="text-xs font-normal text-slate-500 italic ml-1 dark:text-slate-400">(immutable — linked to transactions)</span>}
                                            </FieldLabel>
                                            <input
                                                id="gw-code"
                                                type="text"
                                                required
                                                disabled={!!selectedGateway}
                                                value={formCode}
                                                onChange={e => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="e.g. paystack"
                                                className={`${formMonoInputClass} ${formDisabledClass}`}
                                            />
                                            {!selectedGateway && (
                                                <p className={formHintClass}>
                                                    Lowercase letters, digits, and underscores only. Cannot be changed after transactions reference it.
                                                </p>
                                            )}
                                        </div>

                                        {/* Adapter Engine */}
                                        <div>
                                            <FieldLabel htmlFor="gw-adapter">
                                                Adapter Engine
                                                {selectedGateway && <span className="text-xs font-normal text-slate-500 italic ml-1 dark:text-slate-400">(immutable after creation)</span>}
                                            </FieldLabel>
                                            <div className="relative">
                                                <select
                                                    id="gw-adapter"
                                                    value={formAdapterType}
                                                    onChange={e => handleAdapterChange(e.target.value)}
                                                    disabled={!!selectedGateway}
                                                    className={`${formSelectClass} ${formDisabledClass}`}
                                                >
                                                    {capabilities.map(cap => (
                                                        <option key={cap.code} value={cap.code}>{cap.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${formIconClass}`} />
                                            </div>
                                            <p className={formHintClass}>
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
                                                    className={formSelectClass}
                                                >
                                                    <option value="inactive">Inactive — Disabled, not receiving payments</option>
                                                    <option value="active" disabled={selectedMonnifyActivationBlocked}>Active — Receiving live payments</option>
                                                    <option value="maintenance">Maintenance — Temporarily suspended</option>
                                                </select>
                                                <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${formIconClass}`} />
                                            </div>
                                            {!selectedGateway && (
                                                <p className={formHintClass}>New gateways default to Inactive — activate once credentials are verified.</p>
                                            )}
                                        </div>

                                        {/* Base URL */}
                                        <div className="md:col-span-2">
                                            <FieldLabel htmlFor="gw-baseurl">Base API URL</FieldLabel>
                                            <div className="relative">
                                                <Globe className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${formIconClass}`} />
                                                <input
                                                    id="gw-baseurl"
                                                    type="text"
                                                    value={formBaseUrl}
                                                    onChange={e => setFormBaseUrl(e.target.value)}
                                                    placeholder={currentSpec?.defaultBaseUrl || 'https://api.example.com'}
                                                    className={formInputWithIconClass}
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
                                                                ? env === 'live' ? 'border-violet-400 bg-violet-500/10' : 'border-slate-500 bg-slate-200 dark:bg-slate-800'
                                                                : 'border-slate-200 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-500'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="env"
                                                            value={env}
                                                            checked={formEnvironment === env}
                                                            onChange={() => setFormEnvironment(env)}
                                                            className={env === 'live' ? 'text-violet-400 focus:ring-violet-400/40' : 'text-slate-500 focus:ring-slate-400/40 dark:text-slate-300'}
                                                        />
                                                        <span className={`text-sm font-bold ${env === 'live' && formEnvironment === 'live' ? 'text-violet-700 dark:text-violet-300' : formEnvironment === env ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {env === 'test' ? 'Test' : 'Live'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formEnvironment === 'live' && (
                                                <p className="mt-2 text-xs font-semibold text-amber-600 flex items-center gap-1.5 dark:text-amber-400">
                                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                    Debits real customer funds. A confirmation prompt will appear on save.
                                                </p>
                                            )}
                                        </div>

                                        {/* Platform Default */}
                                        <div>
                                            <FieldLabel>Platform Default</FieldLabel>
                                            {formStatus !== 'active' ? (
                                                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
                                                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Activate this gateway before making it the platform default.
                                                    </p>
                                                </div>
                                            ) : (
                                                <label className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all ${formIsDefault ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10' : 'border-slate-200 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-500'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formIsDefault}
                                                        onChange={e => setFormIsDefault(e.target.checked)}
                                                        className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400/40 w-4 h-4 shrink-0 dark:text-emerald-400"
                                                    />
                                                    <div>
                                                        <p className={`text-sm font-bold ${formIsDefault ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>Set as default gateway</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Used as fallback when no gateway is explicitly chosen by the client</p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>

                                        {/* Routing Priority */}
                                        <div>
                                            <FieldLabel htmlFor="gw-priority">Routing Priority</FieldLabel>
                                            <input
                                                id="gw-priority"
                                                type="number"
                                                min={1}
                                                value={formPriority}
                                                onChange={e => setFormPriority(Number(e.target.value) || 1)}
                                                className={formInputClass}
                                            />
                                            <p className={formHintClass}>
                                                Lower numbers route first for new channel-based funding. Ties break by creation date.
                                            </p>
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
                                                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-500/10 dark:text-sky-200'
                                                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formChannels.includes(ch)}
                                                    onChange={() => handleChannelToggle(ch)}
                                                    className="rounded text-sky-500 focus:ring-sky-400/40 w-4 h-4 shrink-0 dark:text-sky-400"
                                                />
                                                <span className="text-sm font-semibold">{CHANNEL_DISPLAY[ch] || ch}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className={formHintClass}>
                                        Only channels supported by the <strong className="text-slate-700 dark:text-slate-200">{currentSpec?.label}</strong> adapter are shown. Switching adapters resets channels.
                                    </p>
                                </div>

                                {/* ── SECTION 4: Encrypted Credentials (adapter-specific labels) ── */}
                                <div>
                                    <SectionLabel color="bg-emerald-500">Encrypted Credentials</SectionLabel>
                                    <div className="rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-800">
                                        {/* Vault header bar */}
                                        <div className="flex items-center justify-between px-5 py-3 bg-slate-100 dark:bg-slate-950/80">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Vault — AES-256-GCM encrypted at rest</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-emerald-500/10 dark:border-emerald-400/20 dark:text-emerald-400">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                Secure
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-5 bg-slate-50 dark:bg-slate-900/40">
                                            {selectedGateway && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 dark:text-slate-300 dark:bg-blue-500/10 dark:border-blue-400/20">
                                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 dark:text-blue-400" />
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
                                                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                                        {isConfigured ? <><Check className="w-3 h-3" /> Configured</> : 'Not configured'}
                                                    </span>
                                                ) : null;

                                                return (
                                                    <div key={field.key}>
                                                        <FieldLabel htmlFor={`cred-${field.key}`} extra={configuredBadge}>
                                                            {field.label}
                                                            {field.required && <span className="ml-1 text-rose-400">*</span>}
                                                        </FieldLabel>
                                                        <input
                                                            id={`cred-${field.key}`}
                                                            type={field.type}
                                                            value={formCredentials[field.key] || ''}
                                                            onChange={e => setFormCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                            placeholder={selectedGateway && isSensitive && isConfigured
                                                                ? '•••••• (blank = keep current)'
                                                                : field.placeholder}
                                                            className={formMonoInputClass}
                                                        />
                                                    </div>
                                                );
                                            })}

                                            {/* Adapter-specific metadata fields (e.g. Monnify Contract Code) */}
                                            {(currentSpec?.metadataFields || []).map(field => (
                                                <div key={field.key}>
                                                    <FieldLabel htmlFor={`meta-${field.key}`}>
                                                        {field.label}
                                                        {field.required && <span className="ml-1 text-rose-400">*</span>}
                                                    </FieldLabel>
                                                    <input
                                                        id={`meta-${field.key}`}
                                                        type={field.type}
                                                        value={formMetadata[field.key] || ''}
                                                        onChange={e => setFormMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                        placeholder={field.placeholder}
                                                        className={formMonoInputClass}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>{/* end scrollable body */}

                            {/* ── Sticky Footer ── */}
                            <div className="shrink-0 border-t border-slate-200 bg-transparent px-8 py-5 rounded-b-[2rem] flex items-center justify-between gap-4 dark:border-slate-800">
                                <p className="text-xs text-slate-500 hidden sm:block dark:text-slate-400">
                                    {selectedGateway
                                        ? 'Credentials stored encrypted · blank secret = retain existing · changes take effect immediately'
                                        : 'Gateway starts in the selected status above · credentials encrypted before storage'}
                                </p>
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className={modalButtonSecondaryClass}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={modalButtonPrimaryClass}
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

            {replacementGateway && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 dark:bg-slate-950/85">
                    <div className="bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300 mb-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Privileged Operation
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Replace Monnify Merchant</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Reuses gateway code <span className="font-mono font-bold">monnify</span> without changing the current default gateway.
                                    </p>
                                </div>
                                <button onClick={closeMerchantReplacement} disabled={replacementSaving} aria-label="Close dialog" className={modalIconButtonClass}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                                <strong>Historical isolation:</strong> existing reserved accounts remain bound to the previous merchant snapshot. New credentials are authenticated before the existing gateway is changed. Unresolved payments block replacement.
                            </div>

                            <form onSubmit={handleMerchantReplacement} className="space-y-5">
                                <div>
                                    <FieldLabel>Target Environment</FieldLabel>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['test', 'live'] as const).map(environment => (
                                            <label key={environment} className={`rounded-xl border-2 p-3 cursor-pointer ${replacementCredentials.environment === environment ? environment === 'live' ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-violet-400 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                                <input
                                                    type="radio"
                                                    name="replacement-environment"
                                                    value={environment}
                                                    checked={replacementCredentials.environment === environment}
                                                    onChange={() => setReplacementCredentials(prev => prev.environment === environment
                                                        ? prev
                                                        : { ...prev, environment, confirmed: false })}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm font-black uppercase">{environment}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className={formHintClass}>Exact API base: <span className="font-mono">{MONNIFY_API_BASES[replacementCredentials.environment]}</span></p>
                                </div>

                                {replacementCredentials.environment === 'live' && (
                                    <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                                        LIVE replacement uses production credentials and the paid validation checkout will charge real funds.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel htmlFor="replacement-api-key">New API Key</FieldLabel>
                                        <input
                                            id="replacement-api-key"
                                            required
                                            value={replacementCredentials.publicKey}
                                            onChange={e => setReplacementCredentials(prev => ({ ...prev, publicKey: e.target.value }))}
                                            className={formMonoInputClass}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="replacement-contract">New Contract Code</FieldLabel>
                                        <input
                                            id="replacement-contract"
                                            required
                                            value={replacementCredentials.contractCode}
                                            onChange={e => setReplacementCredentials(prev => ({ ...prev, contractCode: e.target.value }))}
                                            className={formMonoInputClass}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="replacement-secret">New Secret Key</FieldLabel>
                                        <input
                                            id="replacement-secret"
                                            type="password"
                                            required
                                            value={replacementCredentials.secretKey}
                                            onChange={e => setReplacementCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                                            className={formMonoInputClass}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="replacement-webhook">New Webhook Secret</FieldLabel>
                                        <input
                                            id="replacement-webhook"
                                            type="password"
                                            value={replacementCredentials.webhookSecret}
                                            onChange={e => setReplacementCredentials(prev => ({ ...prev, webhookSecret: e.target.value }))}
                                            placeholder="Blank uses the new secret key"
                                            className={formMonoInputClass}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <FieldLabel htmlFor="replacement-password">Current SuperAdmin Password</FieldLabel>
                                    <input
                                        id="replacement-password"
                                        type="password"
                                        required
                                        value={replacementCredentials.currentPassword}
                                        onChange={e => setReplacementCredentials(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className={formInputClass}
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
                                    <Info className="w-4 h-4 text-violet-600 dark:text-violet-300 shrink-0 mt-0.5" />
                                    <p className="text-xs leading-relaxed text-violet-800 dark:text-violet-200">
                                        The replacement remains inactive and admin-isolated. It requires a paid validation checkout, customer-funding eligibility approval, then separate activation. It never becomes the default automatically.
                                    </p>
                                </div>

                                <label className="flex items-start gap-3 rounded-xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-500/10">
                                    <input
                                        type="checkbox"
                                        checked={replacementCredentials.confirmed}
                                        onChange={e => setReplacementCredentials(prev => ({ ...prev, confirmed: e.target.checked }))}
                                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className="text-xs font-semibold leading-relaxed text-rose-800 dark:text-rose-200">
                                        I confirm this is an intentional {replacementCredentials.environment.toUpperCase()} merchant replacement, not an ordinary credential rotation.
                                    </span>
                                </label>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
                                    <button type="button" onClick={closeMerchantReplacement} disabled={replacementSaving} className={modalButtonSecondaryClass}>Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={replacementSaving || !replacementCredentials.confirmed}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {replacementSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        Replace Merchant
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {checkoutGateway && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 dark:bg-slate-950/85">
                    <div className="bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className={`text-xs font-black uppercase tracking-widest mb-2 ${checkoutGateway.environment === 'live' ? 'text-rose-600 dark:text-rose-300' : 'text-violet-600 dark:text-violet-300'}`}>Monnify {checkoutGateway.environment}</div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Paid Validation Checkout</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Creates an audited, non-creditable {checkoutGateway.environment.toUpperCase()} checkout without changing activation or default routing.</p>
                            </div>
                            <button onClick={closeCheckoutTest} disabled={checkoutStarting} aria-label="Close dialog" className={modalIconButtonClass}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {checkoutPending ? (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-500/10">
                                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                                        <AlertTriangle className="w-5 h-5" /> Initialization Pending
                                    </div>
                                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Do not retry this checkout. Reconcile reference <span className="font-mono font-bold">{checkoutReference}</span>.</p>
                                </div>
                                <button type="button" onClick={closeCheckoutTest} className={`${modalButtonSecondaryClass} w-full`}>Close</button>
                            </div>
                        ) : !checkoutUrl ? (
                            <form onSubmit={handleCheckoutTest} className="space-y-5">
                                <div>
                                    <FieldLabel htmlFor="checkout-amount">{checkoutGateway.environment.toUpperCase()} Validation Amount</FieldLabel>
                                    <input
                                        id="checkout-amount"
                                        type="number"
                                        min="50"
                                        max="5000"
                                        step="0.01"
                                        required
                                        value={checkoutAmount}
                                        onChange={e => setCheckoutAmount(e.target.value)}
                                        className={formInputClass}
                                    />
                                    <p className={formHintClass}>Allowed range: N50 to N5,000.</p>
                                    <p className={formHintClass}>Checkout links must use exact trusted host <span className="font-mono">{MONNIFY_CHECKOUT_HOSTS[checkoutGateway.environment]}</span>.</p>
                                </div>
                                <div>
                                    <FieldLabel htmlFor="checkout-password">Current SuperAdmin Password</FieldLabel>
                                    <input
                                        id="checkout-password"
                                        type="password"
                                        required
                                        value={checkoutPassword}
                                        onChange={e => setCheckoutPassword(e.target.value)}
                                        className={formInputClass}
                                        autoComplete="current-password"
                                    />
                                </div>
                                {checkoutGateway.environment === 'live' && (
                                    <label className="flex items-start gap-3 rounded-xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-500/10">
                                        <input
                                            type="checkbox"
                                            checked={checkoutLiveConfirmed}
                                            onChange={e => setCheckoutLiveConfirmed(e.target.checked)}
                                            className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-xs font-semibold leading-relaxed text-rose-800 dark:text-rose-200">
                                            I confirm this LIVE validation checkout charges real funds and remains non-creditable.
                                        </span>
                                    </label>
                                )}
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <button type="button" onClick={closeCheckoutTest} disabled={checkoutStarting} className={modalButtonSecondaryClass}>Cancel</button>
                                    <button type="submit" disabled={checkoutStarting || (checkoutGateway.environment === 'live' && !checkoutLiveConfirmed)} className={modalButtonPrimaryClass}>
                                        {checkoutStarting && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        Initialize Checkout
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                                    <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
                                        <CheckCircle2 className="w-5 h-5" /> Checkout Ready
                                    </div>
                                    <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Reference: <span className="font-mono font-bold">{checkoutReference}</span></p>
                                </div>
                                <a
                                    href={checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${modalButtonPrimaryClass} w-full`}
                                >
                                    Open Monnify {checkoutGateway.environment.toUpperCase()} Checkout
                                </a>
                                <button type="button" onClick={closeCheckoutTest} className={`${modalButtonSecondaryClass} w-full`}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {recoveryTarget && (
                <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-md p-4 dark:bg-slate-950/85">
                    <div className="max-h-[calc(100vh-2rem)] max-w-lg w-full overflow-y-auto bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-300 mb-2">
                                    SuperAdmin Recovery
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Recover Monnify Gateway Test</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Freshly verifies the pinned TEST merchant snapshot and preserves the original manual-review evidence.
                                </p>
                            </div>
                            <button onClick={closeGatewayTestRecovery} disabled={recoverySaving} aria-label="Close recovery dialog" className={modalIconButtonClass}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 space-y-2">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Validation Reference</div>
                                <div className="mt-1 break-all font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {recoveryTarget.transaction.reference}
                                </div>
                            </div>
                            <div className="text-xs text-rose-700 dark:text-rose-300">
                                {recoveryTarget.transaction.reconciliationReason || 'Manual review evidence retained'}
                            </div>
                        </div>

                        {recoveryMessage ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                                    <strong>Recovery in progress.</strong> {recoveryMessage}
                                </div>
                                <button type="button" onClick={closeGatewayTestRecovery} className={`${modalButtonSecondaryClass} w-full`}>Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleGatewayTestRecovery} className="space-y-4">
                                <div>
                                    <FieldLabel htmlFor="recovery-password">Current SuperAdmin Password</FieldLabel>
                                    <input
                                        id="recovery-password"
                                        type="password"
                                        required
                                        value={recoveryPassword}
                                        onChange={e => setRecoveryPassword(e.target.value)}
                                        className={formInputClass}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="recovery-note">Audit Note</FieldLabel>
                                    <textarea
                                        id="recovery-note"
                                        value={recoveryNote}
                                        onChange={e => setRecoveryNote(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className={formInputClass}
                                        placeholder="Optional operational context"
                                    />
                                </div>
                                <label className="flex items-start gap-3 rounded-xl border-2 border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
                                    <input
                                        type="checkbox"
                                        checked={recoveryConfirmed}
                                        onChange={e => setRecoveryConfirmed(e.target.checked)}
                                        className="mt-0.5 rounded text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-xs font-semibold leading-relaxed text-violet-800 dark:text-violet-200">
                                        I confirm recovery is limited to this exact TEST gateway payment and must not credit a wallet, activate Monnify, or change the default gateway.
                                    </span>
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    A successful recovery only restores authoritative transaction evidence. Run Check Eligibility separately afterward.
                                </p>
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <button type="button" onClick={closeGatewayTestRecovery} disabled={recoverySaving} className={modalButtonSecondaryClass}>Cancel</button>
                                    <button type="submit" disabled={recoverySaving || !recoveryConfirmed} className={modalButtonPrimaryClass}>
                                        {recoverySaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        Recover Paid Gateway Test
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {eligibilityGateway && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 dark:bg-slate-950/85">
                    <div className="bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300 mb-2">
                                    Monnify {eligibilityGateway.environment}
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Customer-Funding Eligibility</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Server-verifies the exact paid, non-creditable gateway_test before removing admin isolation.
                                </p>
                            </div>
                            <button onClick={closeEligibilityReview} disabled={eligibilitySaving} aria-label="Close dialog" className={modalIconButtonClass}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {eligibilityPendingMessage ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                                    <strong>Verification pending.</strong> {eligibilityPendingMessage}
                                </div>
                                <button type="button" onClick={closeEligibilityReview} className={`${modalButtonSecondaryClass} w-full`}>Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleEligibilityReview} className="space-y-4">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Validation Reference</div>
                                    <div className="mt-1 break-all font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {eligibilityGateway.metadata?.checkoutValidation?.reference}
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel htmlFor="eligibility-password">Current SuperAdmin Password</FieldLabel>
                                    <input
                                        id="eligibility-password"
                                        type="password"
                                        required
                                        value={eligibilityPassword}
                                        onChange={e => setEligibilityPassword(e.target.value)}
                                        className={formInputClass}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <label className="flex items-start gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                                    <input
                                        type="checkbox"
                                        checked={eligibilityConfirmed}
                                        onChange={e => setEligibilityConfirmed(e.target.checked)}
                                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-semibold leading-relaxed text-emerald-800 dark:text-emerald-200">
                                        I confirm eligibility should be enabled only if this exact {eligibilityGateway.environment.toUpperCase()} validation payment is conclusively successful.
                                    </span>
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Approval leaves the gateway inactive and non-default. Separate activation is still required.
                                </p>
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <button type="button" onClick={closeEligibilityReview} disabled={eligibilitySaving} className={modalButtonSecondaryClass}>Cancel</button>
                                    <button type="submit" disabled={eligibilitySaving || !eligibilityConfirmed} className={modalButtonPrimaryClass}>
                                        {eligibilitySaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        Verify Eligibility
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── Confirmation Dialog ── */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 dark:bg-slate-950/80">
                    <div className="bg-white dark:bg-gradient-to-b dark:from-brand-navy-800 dark:to-brand-navy-900 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl shadow-black/50 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${
                                confirmDialog.type === 'danger' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' :
                                confirmDialog.type === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400' :
                                'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'
                            }`}>
                                {confirmDialog.type === 'danger' ? <AlertCircle className="w-5 h-5" /> :
                                 confirmDialog.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                 <Zap className="w-5 h-5" />}
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">{confirmDialog.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">{confirmDialog.message}</p>
                        <div className="flex items-center gap-3 pt-1">
                            <button
                                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                                className={`${modalButtonSecondaryClass} flex-1`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all text-white ${
                                    confirmDialog.type === 'danger' ? 'bg-rose-500 hover:bg-rose-400' :
                                    confirmDialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-400' :
                                    'bg-brand-emerald hover:bg-emerald-500'
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
