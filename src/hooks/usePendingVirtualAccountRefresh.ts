import React from 'react';
import {
    hasRefreshableVirtualAccountState,
    type VirtualAccountProviders,
} from '../utils/virtualAccounts';

const MAX_REFRESH_ATTEMPTS = 6;
const REFRESH_INTERVAL_MS = 5000;

export const usePendingVirtualAccountRefresh = (
    providers: VirtualAccountProviders,
    refresh: () => Promise<unknown>,
) => {
    const hasPending = hasRefreshableVirtualAccountState(providers);
    const [exhausted, setExhausted] = React.useState(false);

    React.useEffect(() => {
        setExhausted(false);
        if (!hasPending) return;
        let refreshing = false;
        let attempts = 0;
        const interval = window.setInterval(async () => {
            if (refreshing || attempts >= MAX_REFRESH_ATTEMPTS) return;
            refreshing = true;
            attempts += 1;
            try {
                await refresh();
            } finally {
                refreshing = false;
                if (attempts >= MAX_REFRESH_ATTEMPTS) {
                    window.clearInterval(interval);
                    setExhausted(true);
                }
            }
        }, REFRESH_INTERVAL_MS);
        return () => window.clearInterval(interval);
    }, [hasPending, refresh]);

    return { exhausted };
};
