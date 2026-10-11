export type VirtualAccount = {
    _id?: string;
    bankName?: string;
    bankCode?: string;
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

const hasText = (value?: string) => Boolean(String(value || '').trim());

export const getVirtualAccountProvider = (account: VirtualAccount) => {
    const provider = String(account.provider || '').trim().toLowerCase();
    // Accounts created before provider tagging were Monnify reserved accounts.
    return provider || 'monnify';
};

export const getVirtualAccountProviderLabel = (account: VirtualAccount) => {
    const provider = getVirtualAccountProvider(account);
    if (provider === 'paystack') return 'Paystack';
    if (provider === 'monnify') return 'Monnify';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
};

export const isUsableVirtualAccount = (account: VirtualAccount) => {
    const status = String(account.provisioningStatus || '').trim().toLowerCase();
    if (status && status !== 'active') return false;
    if (account.active === false || account.assigned === false) return false;

    return hasText(account.bankName)
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

const virtualAccountIdentity = (account: VirtualAccount) => String(
    account._id
    || account.accountReference
    || account.providerAccountId
    || account.provisioningKey
    || '',
);

export const mergeVirtualAccounts = (current: VirtualAccount[] = [], updates: VirtualAccount[] = []) => {
    const merged = [...current];
    updates.forEach((update) => {
        const identity = virtualAccountIdentity(update);
        const index = merged.findIndex((account) => identity
            ? virtualAccountIdentity(account) === identity
            : (
                getVirtualAccountProvider(account) === getVirtualAccountProvider(update)
                && String(account.gatewayId || '') === String(update.gatewayId || '')
                && String(account.preferredBank || '') === String(update.preferredBank || '')
            ));
        if (index >= 0) merged[index] = update;
        else merged.push(update);
    });
    return merged;
};
