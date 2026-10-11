import React from 'react';
import { isPendingVirtualAccount, type VirtualAccount } from '../utils/virtualAccounts';

export const usePendingVirtualAccountRefresh = (
    accounts: VirtualAccount[],
    refresh: () => Promise<unknown>,
) => {
    const hasPending = accounts.some(isPendingVirtualAccount);

    React.useEffect(() => {
        if (!hasPending) return;
        let refreshing = false;
        const interval = window.setInterval(async () => {
            if (refreshing) return;
            refreshing = true;
            try {
                await refresh();
            } finally {
                refreshing = false;
            }
        }, 5000);
        return () => window.clearInterval(interval);
    }, [hasPending, refresh]);
};
