import { create } from 'zustand';
import { getWalletBalance, initPaystackServer } from '../../services/wallet/walletService';

export const useWalletStore = create((set, get) => ({
    balance: 0,
    currency: 'NGN',
    loading: false,
    error: null,

    fetchBalance: async () => {
        set({ loading: true });
        try {
            const data = await getWalletBalance();
            set({ balance: data.balance, currency: data.currency || 'NGN', loading: false, error: null });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    setBalance: (balance) => set({ balance, loading: false, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));

