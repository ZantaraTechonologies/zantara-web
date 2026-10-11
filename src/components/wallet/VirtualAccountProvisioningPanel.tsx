import React from 'react';
import { Building2, Clock3, RotateCw } from 'lucide-react';
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
    getVirtualAccountProvider,
    isFailedVirtualAccount,
    isPendingVirtualAccount,
    type VirtualAccount,
} from '../../utils/virtualAccounts';

type Props = {
    virtualAccounts: VirtualAccount[];
    fundingMethods?: FundingMethod[] | null;
};

const VirtualAccountProvisioningPanel: React.FC<Props> = ({ virtualAccounts, fundingMethods }) => {
    const { fetchVirtualAccount, provisionAccount, provisioningProvider } = useWalletStore();
    const [discoveredMethods, setDiscoveredMethods] = React.useState<FundingMethod[] | null>(
        fundingMethods === undefined ? null : fundingMethods,
    );
    const [selectedBanks, setSelectedBanks] = React.useState<Record<string, string>>({});

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

    usePendingVirtualAccountRefresh(virtualAccounts, fetchVirtualAccount);

    const providers = [...(discoveredMethods || [])
        .filter((method) => method.virtualAccounts?.supported)
        .reduce((byProvider, method) => {
            const provider = getFundingMethodAccountProvider(method);
            const current = byProvider.get(provider);
            if (!current || method.isDefault) byProvider.set(provider, method);
            return byProvider;
        }, new Map<string, FundingMethod>())
        .values()];

    React.useEffect(() => {
        setSelectedBanks((current) => {
            const next = { ...current };
            providers.forEach((method) => {
                const routeCode = method.code.toLowerCase();
                const accountProvider = getFundingMethodAccountProvider(method);
                const slugs = getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs);
                if (accountProvider === 'paystack' && !next[routeCode] && slugs[0]) next[routeCode] = slugs[0];
            });
            return next;
        });
    }, [discoveredMethods]);

    const requestAccount = async (method: FundingMethod) => {
        const routeCode = method.code.toLowerCase();
        const accountProvider = getFundingMethodAccountProvider(method);
        const preferredBank = selectedBanks[routeCode];
        if (accountProvider === 'paystack' && !preferredBank) {
            toast.error('Choose a Paystack bank to continue');
            return;
        }
        try {
            const result = await provisionAccount(routeCode, accountProvider === 'paystack'
                ? { consent: true, preferredBank }
                : {});
            if (!result) return;
            toast.success(result.status === 'pending'
                ? `${formatVirtualAccountProvider(accountProvider)} account request submitted`
                : `${formatVirtualAccountProvider(accountProvider)} account is ready`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Unable to request virtual account');
        }
    };

    return (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5" data-virtual-account-provisioning>
            <div className="flex items-start gap-3">
                <Building2 size={20} className="mt-0.5 shrink-0 text-brand-emerald" />
                <div>
                    <h4 className="font-bold text-slate-900">Request a bank transfer account</h4>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        Choose an enabled provider. An account is created only after you request it.
                    </p>
                </div>
            </div>

            {discoveredMethods === null ? (
                <p className="text-xs font-medium text-slate-500">Checking available providers...</p>
            ) : providers.length === 0 ? (
                <p className="text-xs font-medium text-slate-500">Bank transfer accounts are not enabled right now.</p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {providers.map((method) => {
                        const routeCode = method.code.toLowerCase();
                        const accountProvider = getFundingMethodAccountProvider(method);
                        const label = method.name || formatVirtualAccountProvider(accountProvider);
                        const pending = virtualAccounts.some((account) => (
                            getVirtualAccountProvider(account) === accountProvider && isPendingVirtualAccount(account)
                        ));
                        const failed = virtualAccounts.some((account) => (
                            getVirtualAccountProvider(account) === accountProvider && isFailedVirtualAccount(account)
                        ));
                        const banks = accountProvider === 'paystack'
                            ? getEnvironmentBankSlugs(method.environment, method.virtualAccounts?.providerSlugs)
                            : [];
                        const busy = Boolean(provisioningProvider);

                        return (
                            <div key={method.code} className="space-y-3 rounded-xl border border-slate-200 bg-surface p-4">
                                <div>
                                    <p className="font-bold text-slate-900">{label}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {method.virtualAccounts?.type || 'Virtual account'}
                                    </p>
                                </div>
                                {banks.length > 0 && (
                                    <label className="block space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferred bank</span>
                                        <select
                                            aria-label={`${formatVirtualAccountProvider(accountProvider)} preferred bank`}
                                            value={selectedBanks[routeCode] || banks[0]}
                                            onChange={(event) => setSelectedBanks((current) => ({ ...current, [routeCode]: event.target.value }))}
                                            disabled={busy || pending}
                                            className="w-full rounded-lg border border-slate-200 bg-surface px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald disabled:opacity-50"
                                        >
                                            {banks.map((bank) => <option key={bank} value={bank}>{formatBankSlug(bank)}</option>)}
                                        </select>
                                    </label>
                                )}
                                <button
                                    type="button"
                                    onClick={() => requestAccount(method)}
                                    disabled={busy || pending || (accountProvider === 'paystack' && banks.length === 0)}
                                    data-provision-provider={routeCode}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-emerald px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {pending ? <Clock3 size={14} /> : failed ? <RotateCw size={14} /> : <Building2 size={14} />}
                                    {provisioningProvider === routeCode
                                        ? 'Requesting...'
                                        : pending
                                            ? 'Setup in progress'
                                            : failed
                                                ? `Retry ${label}`
                                                : `Request ${label}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VirtualAccountProvisioningPanel;
