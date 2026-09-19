import { create } from 'zustand';
import { 
    getWalletBalance, 
    getVirtualAccount, 
    getLinkedAccounts, 
    addLinkedAccount, 
    deleteLinkedAccount, 
    getMyWithdrawals,
    generateVirtualAccounts
} from '../../services/wallet/walletService';
import { getSessionEpoch, isSessionEpochCurrent, registerSessionReset } from '../../app/sessionLifecycle';

const walletResetState = {
    balance: 0,
    totalBalance: undefined,
    frozenBalance: undefined,
    currency: 'NGN',
    virtualAccount: null,
    linkedAccounts: [],
    withdrawals: [],
    loading: false,
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
        const epoch = getSessionEpoch();
        try {
            const data = await getVirtualAccount();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ virtualAccount: data });
        } catch {
            if (!isSessionEpochCurrent(epoch)) return;
            console.error('Failed to fetch virtual account');
        }
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

    generateAccounts: async () => {
        const epoch = getSessionEpoch();
        set({ loading: true });
        try {
            await generateVirtualAccounts();
            if (!isSessionEpochCurrent(epoch)) return;
            await get().fetchVirtualAccount();
            if (!isSessionEpochCurrent(epoch)) return;
            set({ loading: false });
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) return;
            console.error('Failed to generate virtual accounts');
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    setBalance: (balance) => set({ balance, loading: false, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    reset: () => set(walletResetState),
}));

registerSessionReset('wallet', () => useWalletStore.getState().reset());
