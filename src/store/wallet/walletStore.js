import { create } from 'zustand';
import { 
    getWalletBalance, 
    initPaystackServer, 
    getVirtualAccount, 
    getLinkedAccounts, 
    addLinkedAccount, 
    deleteLinkedAccount, 
    getMyWithdrawals 
} from '../../services/wallet/walletService';

export const useWalletStore = create((set, get) => ({
    balance: 0,
    currency: 'NGN',
    virtualAccount: null,
    linkedAccounts: [],
    withdrawals: [],
    loading: false,
    error: null,

    fetchBalance: async () => {
        try {
            const data = await walletService.getWalletBalance();
            set({ 
                balance: data.available, // Available for spending
                totalBalance: data.balance, // Total including frozen
                frozenBalance: data.frozen,
                currency: data.currency || '₦' 
            });
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
        }
    },

    fetchVirtualAccount: async () => {
        try {
            const data = await walletService.getVirtualAccount();
            set({ virtualAccount: data });
        } catch (error) {
            console.error('Failed to fetch virtual account:', error);
        }
    },

    fetchLinkedAccounts: async () => {
        set({ loading: true });
        try {
            const data = await getLinkedAccounts();
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addAccount: async (accountData) => {
        set({ loading: true });
        try {
            await addLinkedAccount(accountData);
            const data = await getLinkedAccounts();
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    removeAccount: async (accountId) => {
        set({ loading: true });
        try {
            await deleteLinkedAccount(accountId);
            const data = await getLinkedAccounts();
            set({ linkedAccounts: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchWithdrawals: async () => {
        try {
            const data = await getMyWithdrawals();
            set({ withdrawals: data });
        } catch (error) {
            console.error('Failed to fetch withdrawals', error);
        }
    },

    setBalance: (balance) => set({ balance, loading: false, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));

