import { create } from 'zustand';
import { 
    getWalletBalance, 
    getVirtualAccounts,
    getLinkedAccounts, 
    addLinkedAccount, 
    deleteLinkedAccount, 
    getMyWithdrawals,
    requestVirtualAccounts
} from '../../services/wallet/walletService';
import { getSessionEpoch, isSessionEpochCurrent, registerSessionReset } from '../../app/sessionLifecycle';
import { useAuthStore } from '../auth/authStore';
import { replaceVirtualAccounts } from '../../utils/virtualAccounts';

let virtualAccountRefreshGeneration = 0;
let virtualAccountRefreshPromise = null;

const walletResetState = {
    balance: 0,
    totalBalance: undefined,
    frozenBalance: undefined,
    currency: 'NGN',
    virtualAccounts: [],
    virtualAccountProviders: {},
    legacyVirtualAccountReviewRequired: false,
    virtualAccountStatusError: null,
    linkedAccounts: [],
    withdrawals: [],
    loading: false,
    requestingVirtualAccounts: false,
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
                if (!isSessionEpochCurrent(epoch) || generation !== virtualAccountRefreshGeneration) return false;
                const virtualAccounts = replaceVirtualAccounts(data.accounts);
                set({
                    virtualAccounts,
                    virtualAccountProviders: data.providers,
                    legacyVirtualAccountReviewRequired: data.legacyReviewRequired,
                    virtualAccountStatusError: null,
                });
                const user = useAuthStore.getState().user;
                if (user) useAuthStore.getState().setUser({ ...user, virtualAccounts });
                return true;
            } catch {
                if (!isSessionEpochCurrent(epoch) || generation !== virtualAccountRefreshGeneration) return false;
                console.error('Failed to fetch virtual account');
                set({
                    virtualAccounts: [],
                    virtualAccountProviders: {},
                    legacyVirtualAccountReviewRequired: false,
                    virtualAccountStatusError: 'Unable to check bank account availability. Please try again.',
                });
                const user = useAuthStore.getState().user;
                if (user) useAuthStore.getState().setUser({ ...user, virtualAccounts: [] });
                return false;
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

    requestAccounts: async (payload = {}) => {
        if (get().requestingVirtualAccounts) return null;
        const epoch = getSessionEpoch();
        set({ requestingVirtualAccounts: true, error: null });
        try {
            const result = await requestVirtualAccounts(payload);
            if (!isSessionEpochCurrent(epoch)) return;
            virtualAccountRefreshGeneration += 1;
            virtualAccountRefreshPromise = null;
            const refreshed = await get().fetchVirtualAccount();
            if (!isSessionEpochCurrent(epoch)) return;
            if (!refreshed) return null;
            return result;
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            virtualAccountRefreshGeneration += 1;
            virtualAccountRefreshPromise = null;
            await get().fetchVirtualAccount();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ error: 'Unable to request a bank account. Please check availability and try again.' });
            throw error;
        } finally {
            if (isSessionEpochCurrent(epoch)) set({ requestingVirtualAccounts: false });
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
