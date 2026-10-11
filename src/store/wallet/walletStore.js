import { create } from 'zustand';
import { 
    getWalletBalance, 
    getVirtualAccounts,
    getLinkedAccounts, 
    addLinkedAccount, 
    deleteLinkedAccount, 
    getMyWithdrawals,
    provisionVirtualAccount
} from '../../services/wallet/walletService';
import { getSessionEpoch, isSessionEpochCurrent, registerSessionReset } from '../../app/sessionLifecycle';
import { useAuthStore } from '../auth/authStore';
import { mergeVirtualAccounts } from '../../utils/virtualAccounts';

let virtualAccountRefreshGeneration = 0;
let virtualAccountRefreshPromise = null;

const walletResetState = {
    balance: 0,
    totalBalance: undefined,
    frozenBalance: undefined,
    currency: 'NGN',
    virtualAccounts: [],
    linkedAccounts: [],
    withdrawals: [],
    loading: false,
    provisioningProvider: null,
    error: null,
};

export const useWalletStore = create((set, get) => ({
    ...walletResetState,

    fetchBalance: async () => {
        const epoch = getSessionEpoch();
        set({ loading: true });
        try {
            const data = await getWalletBalance();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ 
                balance: data.available, // Available for spending
                totalBalance: data.balance, // Total including frozen
                frozenBalance: data.frozen,
                currency: data.currency || '₦',
                loading: false
            });
        } catch {
            if (!isSessionEpochCurrent(epoch)) return;
            console.error('Failed to fetch wallet balance');
            set({ loading: false });
        }
    },

    fetchVirtualAccount: async () => {
        if (virtualAccountRefreshPromise) return virtualAccountRefreshPromise;
        const epoch = getSessionEpoch();
        const generation = ++virtualAccountRefreshGeneration;
        const request = (async () => {
            try {
                const data = await getVirtualAccounts();
                if (!isSessionEpochCurrent(epoch) || generation !== virtualAccountRefreshGeneration) return;
                set({ virtualAccounts: data });
                const user = useAuthStore.getState().user;
                if (user) useAuthStore.getState().setUser({ ...user, virtualAccounts: data });
            } catch {
                if (!isSessionEpochCurrent(epoch)) return;
                console.error('Failed to fetch virtual account');
            } finally {
                if (virtualAccountRefreshPromise === request) virtualAccountRefreshPromise = null;
            }
        })();
        virtualAccountRefreshPromise = request;
        return request;
    },

    fetchLinkedAccounts: async () => {
        const epoch = getSessionEpoch();
        set({ loading: true });
        try {
            const data = await getLinkedAccounts();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            set({ error: error.message, loading: false });
        }
    },

    addAccount: async (accountData) => {
        const epoch = getSessionEpoch();
        set({ loading: true });
        try {
            await addLinkedAccount(accountData);
            if (!isSessionEpochCurrent(epoch)) return;
            const data = await getLinkedAccounts();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    removeAccount: async (accountId) => {
        const epoch = getSessionEpoch();
        set({ loading: true });
        try {
            await deleteLinkedAccount(accountId);
            if (!isSessionEpochCurrent(epoch)) return;
            const data = await getLinkedAccounts();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            set({ error: error.message, loading: false });
        }
    },

    fetchWithdrawals: async () => {
        const epoch = getSessionEpoch();
        try {
            const data = await getMyWithdrawals();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ withdrawals: data });
        } catch {
            if (!isSessionEpochCurrent(epoch)) return;
            console.error('Failed to fetch withdrawals');
        }
    },

    provisionAccount: async (provider, options = {}) => {
        if (get().provisioningProvider) return null;
        const epoch = getSessionEpoch();
        const normalizedProvider = String(provider || '').trim().toLowerCase();
        set({ provisioningProvider: normalizedProvider, error: null });
        try {
            const result = await provisionVirtualAccount(normalizedProvider, options);
            if (!isSessionEpochCurrent(epoch)) return;
            if (Array.isArray(result?.accounts)) {
                virtualAccountRefreshGeneration += 1;
                virtualAccountRefreshPromise = null;
                const virtualAccounts = mergeVirtualAccounts(get().virtualAccounts, result.accounts);
                set({ virtualAccounts });
                const user = useAuthStore.getState().user;
                if (user) useAuthStore.getState().setUser({ ...user, virtualAccounts });
            }
            await get().fetchVirtualAccount();
            if (!isSessionEpochCurrent(epoch)) return;
            return result;
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            const message = error.response?.data?.message || error.message || 'Failed to request virtual account';
            set({ error: message });
            throw error;
        } finally {
            if (isSessionEpochCurrent(epoch)) set({ provisioningProvider: null });
        }
    },

    setBalance: (balance) => set({ balance, loading: false, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    reset: () => {
        virtualAccountRefreshGeneration += 1;
        virtualAccountRefreshPromise = null;
        set(walletResetState);
    },
}));

registerSessionReset('wallet', () => useWalletStore.getState().reset());
