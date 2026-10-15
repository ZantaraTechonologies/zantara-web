import React from 'react';
import { Building2, Check, Clock3, RotateCw, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as walletService from '../../services/wallet/walletService';
import type { FundingMethod } from '../../services/wallet/walletService';
import { useWalletStore } from '../../store/wallet/walletStore';
import { usePendingVirtualAccountRefresh } from '../../hooks/usePendingVirtualAccountRefresh';
import {
    formatBankSlug,
    formatVirtualAccountProvider,
    getEnvironmentBankSlugs,
    getFundingMethodAccountProvider,
    getVirtualAccountStatusMessage,
    isUsableVirtualAccount,
    isValidVirtualAccountConsent,
    PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION,
    type VirtualAccount,
    type VirtualAccountProviders,
    type VirtualAccountRequestPayload,
} from '../../utils/virtualAccounts';

type Props = {
    virtualAccounts: VirtualAccount[];
    providers: VirtualAccountProviders;
    fundingMethods?: FundingMethod[] | null;
    showWhenAccountExists?: boolean;
};

const VirtualAccountProvisioningPanel: React.FC<Props> = ({
    virtualAccounts,
    providers,
    fundingMethods,
    showWhenAccountExists = false,
}) => {
    const {
        fetchVirtualAccount,
        requestAccounts,
        requestingVirtualAccounts,
        virtualAccountStatusError,
    } = useWalletStore();
    const [expanded, setExpanded] = React.useState(false);
    const [acceptedVersions, setAcceptedVersions] = React.useState<Record<string, string>>({});
    const [retryApproved, setRetryApproved] = React.useState<Record<string, boolean>>({});
    const [selectedBanks, setSelectedBanks] = React.useState<Record<string, string>>({});
    const [discoveredMethods, setDiscoveredMethods] = React.useState<FundingMethod[] | null>(
        fundingMethods === undefined ? null : fundingMethods,
    );
    const { exhausted } = usePendingVirtualAccountRefresh(providers, fetchVirtualAccount);
    const hasUsableAccount = virtualAccounts.some(isUsableVirtualAccount);

    React.useEffect(() => {
        if (fundingMethods !== undefined) {
            setDiscoveredMethods(fundingMethods);
            return;
        }
        let active = true;
        walletService.getFundingMethods()
            .then((methods) => { if (active) setDiscoveredMethods(methods || []); })
            .catch(() => { if (active) setDiscoveredMethods([]); });
        return () => { active = false; };
    }, [fundingMethods]);

    const methodByProvider = new Map<string, FundingMethod>();
    for (const method of discoveredMethods || []) {
        if (!method.virtualAccounts?.supported) continue;
        const provider = getFundingMethodAccountProvider(method);
        const current = methodByProvider.get(provider);
        if (!current || method.isDefault) methodByProvider.set(provider, method);
    }

    const providerEntries = Object.entries(providers);
    const requestableEntries = providerEntries.filter(([, value]) => (
        ['consent_required', 'eligible', 'transient_failure', 'definitive_rejection'].includes(value.status)
    ));
    const pendingEntries = providerEntries.filter(([, value]) => (
        ['awaiting_assignment', 'reconciliation_required'].includes(value.status)
    ));

    React.useEffect(() => {
        setSelectedBanks((current) => {
            const next = { ...current };
            for (const [provider, status] of providerEntries) {
                if (provider !== 'paystack' || status.status !== 'consent_required') continue;
                const method = methodByProvider.get(provider);
                const banks = method
                    ? getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs)
                    : [];
                if (!banks.includes(next[provider])) next[provider] = banks[0] || '';
            }
            return next;
        });
    }, [providers, discoveredMethods]);

    if (
        hasUsableAccount
        && (!showWhenAccountExists || providerEntries.every(([, status]) => status.status === 'active'))
    ) return null;

    const buildPayload = (): VirtualAccountRequestPayload => {
        const consents: NonNullable<VirtualAccountRequestPayload['consents']> = {};
        for (const [provider, status] of requestableEntries) {
            const method = methodByProvider.get(provider);
            const allowedBanks = provider === 'paystack' && method
                ? getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs)
                : [];
            if (
                !isValidVirtualAccountConsent(provider, status)
                || acceptedVersions[provider] !== PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION
                || (provider === 'paystack' && !allowedBanks.includes(selectedBanks[provider]))
            ) continue;
            consents[provider] = {
                granted: true,
                version: PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION,
                ...(provider === 'paystack' && selectedBanks[provider]
                    ? { preferredBank: selectedBanks[provider] }
                    : {}),
            };
        }
        return {
            ...(Object.keys(consents).length > 0 ? { consents } : {}),
            retryRejectedProviders: requestableEntries
                .filter(([provider, status]) => status.status === 'definitive_rejection' && retryApproved[provider])
                .map(([provider]) => provider),
        };
    };

    const hasEligibleRequest = requestableEntries.some(([provider, status]) => {
        if (['eligible', 'transient_failure'].includes(status.status)) return true;
        if (status.status === 'definitive_rejection') return retryApproved[provider] === true;
        if (
            !isValidVirtualAccountConsent(provider, status)
            || acceptedVersions[provider] !== PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION
        ) return false;
        if (provider !== 'paystack') return true;
        const method = methodByProvider.get(provider);
        const allowedBanks = method
            ? getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs)
            : [];
        return allowedBanks.includes(selectedBanks[provider]);
    });

    const submitRequest = async () => {
        if (!hasEligibleRequest) return;
        const payload = buildPayload();
        setAcceptedVersions({});
        setRetryApproved({});
        try {
            const result = await requestAccounts(payload);
            if (!result) return;
            if (['active', 'partial', 'pending'].includes(result.status)) setExpanded(false);
            if (result.status === 'active') toast.success('Your bank transfer account is ready');
            else if (result.status === 'partial') toast.success('One account is ready; another provider needs attention');
            else if (result.status === 'pending') toast.success('Bank account request submitted');
            else if (result.status === 'action_required') toast.error('Additional consent or account review is required');
            else toast.error('No provider could complete the bank account request');
        } catch {
            toast.error('Unable to request a bank account. Check availability before trying again.');
        }
    };

    return (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5" data-virtual-account-provisioning>
            <div className="flex items-start gap-3">
                <Building2 size={20} className="mt-0.5 shrink-0 text-brand-emerald" />
                <div>
                    <h4 className="font-bold text-slate-900">Permanent bank transfer account</h4>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        One request asks every available account provider. Each provider completes independently.
                    </p>
                </div>
            </div>

            {virtualAccountStatusError ? (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-rose-700">{virtualAccountStatusError}</p>
                    <button
                        type="button"
                        onClick={() => fetchVirtualAccount()}
                        className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-brand-emerald"
                    >
                        Retry availability check
                    </button>
                </div>
            ) : providerEntries.length === 0 ? (
                <p className="text-xs font-medium text-slate-500">Checking account availability...</p>
            ) : (
                <div className="space-y-3">
                    {providerEntries
                        .filter(([, status]) => !['active', 'eligible', 'consent_required'].includes(status.status))
                        .map(([provider, status]) => {
                            const pending = ['awaiting_assignment', 'reconciliation_required'].includes(status.status);
                            return (
                                <div key={provider} className={`flex items-start gap-3 rounded-xl border p-3 ${pending ? 'border-amber-100 bg-amber-50' : 'border-slate-200 bg-surface'}`}>
                                    {pending ? <Clock3 size={17} className="mt-0.5 shrink-0 text-amber-600" /> : <RotateCw size={17} className="mt-0.5 shrink-0 text-slate-500" />}
                                    <p className="text-xs font-medium leading-relaxed text-slate-600">{getVirtualAccountStatusMessage(provider, status)}</p>
                                </div>
                            );
                        })}

                    {exhausted && pendingEntries.length > 0 && (
                        <p className="text-xs font-medium text-amber-700">Automatic checks have paused. Refresh this page later to check again.</p>
                    )}

                    {requestableEntries.length > 0 && !expanded && (
                        <button
                            type="button"
                            onClick={() => setExpanded(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-emerald px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-brand-emerald-600"
                        >
                            <Building2 size={16} />
                            Request Bank Account
                        </button>
                    )}

                    {expanded && (
                        <div className="space-y-4 rounded-xl border border-slate-200 bg-surface p-4">
                            {requestableEntries.map(([provider, status]) => {
                                const label = formatVirtualAccountProvider(provider);
                                const consentVersion = status.consent?.version || '';
                                const method = methodByProvider.get(provider);
                                const banks = provider === 'paystack' && method
                                    ? getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs)
                                    : [];
                                if (status.status === 'definitive_rejection') {
                                    return (
                                        <label key={provider} className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
                                            <input
                                                type="checkbox"
                                                data-retry-provider={provider}
                                                checked={retryApproved[provider] === true}
                                                onChange={(event) => setRetryApproved((current) => ({ ...current, [provider]: event.target.checked }))}
                                                className="mt-0.5"
                                            />
                                            <span className="text-xs font-medium leading-relaxed text-rose-800">
                                                Retry the rejected {label} request after confirming my profile details are correct.
                                            </span>
                                        </label>
                                    );
                                }
                                if (status.status !== 'consent_required') return null;
                                if (!isValidVirtualAccountConsent(provider, status)) {
                                    return (
                                        <p key={provider} className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                                            {label} consent details are unavailable or outdated, so consent cannot be submitted.
                                        </p>
                                    );
                                }
                                return (
                                    <div key={provider} className="space-y-3 rounded-xl border border-slate-200 p-3">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                data-consent-provider={provider}
                                                checked={Boolean(consentVersion) && acceptedVersions[provider] === consentVersion}
                                                onChange={(event) => setAcceptedVersions((current) => ({
                                                    ...current,
                                                    [provider]: event.target.checked ? consentVersion : '',
                                                }))}
                                                className="mt-0.5"
                                            />
                                            <span className="text-xs font-medium leading-relaxed text-slate-700">
                                                I consent to <strong>{label}</strong> creating and maintaining a permanent bank transfer account in my name for funding this wallet.
                                                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Consent version {consentVersion || 'unavailable'}</span>
                                            </span>
                                        </label>
                                        {provider === 'paystack' && (
                                            banks.length > 0 ? (
                                                <label className="block space-y-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferred Paystack bank</span>
                                                    <select
                                                        aria-label="Paystack preferred bank"
                                                        value={selectedBanks[provider] || banks[0]}
                                                        onChange={(event) => setSelectedBanks((current) => ({ ...current, [provider]: event.target.value }))}
                                                        className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald"
                                                    >
                                                        {banks.map((bank) => <option key={bank} value={bank}>{formatBankSlug(bank)}</option>)}
                                                    </select>
                                                </label>
                                            ) : (
                                                <p className="text-xs font-medium text-amber-700">Paystack bank choices are unavailable for the active environment, so Paystack consent cannot be submitted.</p>
                                            )
                                        )}
                                    </div>
                                );
                            })}

                            <div className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-500">
                                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-emerald" />
                                Consent is recorded separately for each named provider and only for permanent wallet-funding accounts.
                            </div>
                            <button
                                type="button"
                                onClick={submitRequest}
                                disabled={!hasEligibleRequest || requestingVirtualAccounts}
                                data-request-bank-account
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-emerald px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-brand-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {requestingVirtualAccounts ? <RotateCw size={15} className="animate-spin" /> : <Check size={15} />}
                                {requestingVirtualAccounts ? 'Requesting...' : 'Confirm Request Bank Account'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VirtualAccountProvisioningPanel;
