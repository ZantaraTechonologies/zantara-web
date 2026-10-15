export type VirtualAccount = {
    _id?: string;
    bankName?: string;
    bankCode?: string;
    bankSlug?: string;
    accountName?: string;
    accountNumber?: string;
    currency?: string;
    provider?: string;
    gatewayId?: string;
    accountReference?: string;
    providerAccountId?: string;
    provisioningKey?: string;
    provisioningStatus?: 'pending' | 'active' | 'failed' | string;
    active?: boolean;
    assigned?: boolean;
    preferredBank?: string;
};

export type VirtualAccountConsentRequirement = {
    required: true;
    version: string;
    purpose: 'permanent_virtual_account' | string;
    provider: string;
    preferredBanks?: string[];
};

export type VirtualAccountProviderStatus = {
    status: 'active'
        | 'eligible'
        | 'awaiting_assignment'
        | 'consent_required'
        | 'ineligible'
        | 'legacy_review_required'
        | 'definitive_rejection'
        | 'transient_failure'
        | 'reconciliation_required'
        | string;
    code?: string;
    existing?: boolean;
    consent?: VirtualAccountConsentRequirement;
};

export type VirtualAccountProviders = Record<string, VirtualAccountProviderStatus>;

export type VirtualAccountStatusResponse = {
    success: boolean;
    accounts: VirtualAccount[];
    providers: VirtualAccountProviders;
    legacyReviewRequired: boolean;
};

export type VirtualAccountRequestPayload = {
    consents?: Record<string, {
        granted: true;
        version: string;
        preferredBank?: string;
    }>;
    retryRejectedProviders?: string[];
};

export type VirtualAccountRequestResponse = {
    success: boolean;
    status: 'active' | 'partial' | 'pending' | 'failed' | 'action_required' | string;
    accounts: VirtualAccount[];
    providers: VirtualAccountProviders;
};

export const PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION = 'permanent_virtual_account_v1';
const VIRTUAL_ACCOUNT_PROVIDERS = ['paystack', 'monnify'] as const;
const VIRTUAL_ACCOUNT_PROVIDER_STATUSES = new Set([
    'active', 'eligible', 'awaiting_assignment', 'consent_required', 'ineligible',
    'legacy_review_required', 'definitive_rejection', 'transient_failure', 'reconciliation_required',
]);
const VIRTUAL_ACCOUNT_REQUEST_STATUSES = new Set(['active', 'partial', 'pending', 'failed', 'action_required']);

const hasText = (value: unknown) => typeof value === 'string' && Boolean(value.trim());
const isRecord = (value: unknown): value is Record<string, unknown> => (
    Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);
const hasValidOptionalFields = (
    value: Record<string, unknown>,
    fields: string[],
    type: 'string' | 'boolean',
) => fields.every((field) => value[field] === undefined || typeof value[field] === type);

const isVirtualAccountRecord = (value: unknown): value is VirtualAccount => isRecord(value)
    && hasValidOptionalFields(value, ['_id', 'bankCode', 'bankSlug'], 'string')
    && VIRTUAL_ACCOUNT_PROVIDERS.includes(value.provider as typeof VIRTUAL_ACCOUNT_PROVIDERS[number])
    && hasText(value.bankName)
    && hasText(value.accountName)
    && hasText(value.accountNumber)
    && value.currency === 'NGN'
    && value.provisioningStatus === 'active'
    && value.active === true
    && value.assigned === true;

const isConsentRecord = (value: unknown, provider: string) => isRecord(value)
    && value.required === true
    && value.version === PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION
    && value.purpose === 'permanent_virtual_account'
    && value.provider === provider
    && (value.preferredBanks === undefined
        || (Array.isArray(value.preferredBanks) && value.preferredBanks.every(hasText)));

const isProviderMap = (value: unknown): value is VirtualAccountProviders => {
    if (!isRecord(value) || Object.keys(value).length !== VIRTUAL_ACCOUNT_PROVIDERS.length) return false;
    return VIRTUAL_ACCOUNT_PROVIDERS.every((provider) => {
        const status = value[provider];
        if (!isRecord(status) || !VIRTUAL_ACCOUNT_PROVIDER_STATUSES.has(String(status.status || ''))) return false;
        if (!hasValidOptionalFields(status, ['code'], 'string') || !hasValidOptionalFields(status, ['existing'], 'boolean')) return false;
        if (status.consent !== undefined && !isConsentRecord(status.consent, provider)) return false;
        return !['consent_required', 'eligible'].includes(String(status.status)) || isConsentRecord(status.consent, provider);
    });
};

export const isVirtualAccountStatusResponse = (value: unknown): value is VirtualAccountStatusResponse => {
    if (!isRecord(value) || value.success !== true) return false;
    if (!Array.isArray(value.accounts) || !value.accounts.every(isVirtualAccountRecord)) return false;
    if (!isProviderMap(value.providers) || typeof value.legacyReviewRequired !== 'boolean') return false;
    const accounts = value.accounts as VirtualAccount[];
    return VIRTUAL_ACCOUNT_PROVIDERS.every((provider) => {
        const hasAccount = accounts.some((account) => account.provider === provider);
        return (value.providers[provider].status === 'active') === hasAccount;
    });
};

export const isVirtualAccountRequestResponse = (value: unknown): value is VirtualAccountRequestResponse => {
    if (!isRecord(value) || !VIRTUAL_ACCOUNT_REQUEST_STATUSES.has(String(value.status || ''))) return false;
    if (value.success !== (value.status !== 'failed')) return false;
    if (!Array.isArray(value.accounts) || !value.accounts.every(isVirtualAccountRecord)) return false;
    return isProviderMap(value.providers);
};

export const getVirtualAccountProvider = (account: VirtualAccount) => {
    const provider = String(account.provider || '').trim().toLowerCase();
    return ['paystack', 'monnify'].includes(provider) ? provider : '';
};

export const getVirtualAccountProviderLabel = (account: VirtualAccount) => {
    const provider = getVirtualAccountProvider(account);
    if (provider === 'paystack') return 'Paystack';
    if (provider === 'monnify') return 'Monnify';
    return 'Unverified provider';
};

export const isValidVirtualAccountConsent = (
    provider: string,
    status: VirtualAccountProviderStatus,
) => {
    const normalizedProvider = String(provider || '').trim().toLowerCase();
    const consent = status.consent;
    return provider === normalizedProvider
        && ['paystack', 'monnify'].includes(normalizedProvider)
        && status.status === 'consent_required'
        && consent?.required === true
        && consent.version === PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION
        && consent.purpose === 'permanent_virtual_account'
        && String(consent.provider || '').trim() === normalizedProvider;
};

export const isUsableVirtualAccount = (account: VirtualAccount) => {
    return hasText(getVirtualAccountProvider(account))
        && String(account.currency || '').trim().toUpperCase() === 'NGN'
        && account.provisioningStatus === 'active'
        && account.active === true
        && account.assigned === true
        && hasText(account.bankName)
        && hasText(account.accountName)
        && hasText(account.accountNumber);
};

export const isPendingVirtualAccount = (account: VirtualAccount) => (
    String(account.provisioningStatus || '').trim().toLowerCase() === 'pending'
);

export const isFailedVirtualAccount = (account: VirtualAccount) => (
    String(account.provisioningStatus || '').trim().toLowerCase() === 'failed'
);

export const formatVirtualAccountProvider = (provider: string) => {
    const normalized = String(provider || '').trim().toLowerCase();
    if (normalized === 'paystack') return 'Paystack';
    if (normalized === 'monnify') return 'Monnify';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const formatBankSlug = (slug: string) => String(slug || '')
    .trim()
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getEnvironmentBankSlugs = (environment: string, slugs: string[] = []) => {
    const unique = [...new Set(slugs.map((slug) => String(slug || '').trim()).filter(Boolean))];
    const normalizedEnvironment = String(environment || '').trim().toLowerCase();
    if (!['test', 'live'].includes(normalizedEnvironment)) return [];
    return unique.filter((slug) => normalizedEnvironment === 'test'
        ? slug.toLowerCase().includes('test')
        : !slug.toLowerCase().includes('test'));
};

export const getFundingMethodAccountProvider = (method: {
    code?: string;
    virtualAccounts?: { type?: string | null };
}) => {
    const type = String(method.virtualAccounts?.type || '').trim().toLowerCase();
    if (type === 'dedicated') return 'paystack';
    if (type === 'reserved') return 'monnify';
    return String(method.code || '').trim().toLowerCase();
};

export const hasRefreshableVirtualAccountState = (providers: VirtualAccountProviders = {}) => (
    Object.values(providers).some(({ status }) => (
        status === 'awaiting_assignment' || status === 'reconciliation_required'
    ))
);

export const getVirtualAccountStatusMessage = (provider: string, status: VirtualAccountProviderStatus) => {
    const label = formatVirtualAccountProvider(provider);
    switch (status.status) {
        case 'awaiting_assignment':
            return `${label} is completing account assignment.`;
        case 'reconciliation_required':
            return `${label} received the request and is confirming the final account state.`;
        case 'consent_required':
            return `${label} requires your express consent before an account can be requested.`;
        case 'legacy_review_required':
            return 'A historical bank account needs support review before Monnify can be requested.';
        case 'definitive_rejection':
            return `${label} rejected the previous request. Retry only after reviewing your details.`;
        case 'transient_failure':
            return `${label} could not complete the request. You can try again safely.`;
        case 'ineligible':
            return `${label} is not currently available for this account.`;
        default:
            return '';
    }
};

export const replaceVirtualAccounts = (accounts: VirtualAccount[] = []) => accounts
    .filter(isUsableVirtualAccount)
    .map((account) => ({
        ...(account._id ? { _id: account._id } : {}),
        provider: getVirtualAccountProvider(account),
        ...(account.bankCode ? { bankCode: account.bankCode } : {}),
        ...(account.bankSlug ? { bankSlug: account.bankSlug } : {}),
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        currency: 'NGN',
        provisioningStatus: 'active' as const,
        active: true,
        assigned: true,
    }));
