import businessService, { FinancialSummary, Expense, Settlement } from '../services/businessService';
export type { FinancialSummary, Expense, Settlement };

import { create } from 'zustand';

interface BusinessState {
    summary: FinancialSummary;
    expenses: Expense[];
    settlements: Settlement[];
    cashFlow: any[];
    refunds: any[];
    wallet: any;
    loading: boolean;
    error: string | null;

    fetchSummary: () => Promise<void>;
    fetchExpenses: () => Promise<void>;
    addExpense: (expense: Omit<Expense, '_id' | 'date'>) => Promise<void>;
    fetchSettlements: () => Promise<void>;
    fetchCashFlow: () => Promise<void>;
    fetchRefunds: () => Promise<void>;
    fetchAnalytics: () => Promise<void>;
    fetchWallet: () => Promise<void>;
}

const initialSummary: FinancialSummary = {
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    reservedPayouts: 0,
    escrowFlow: 0,
    recentActivities: []
};

export const useBusinessStore = create<BusinessState>((set) => ({
    summary: initialSummary,
    expenses: [],
    settlements: [],
    cashFlow: [],
    refunds: [],
    wallet: null,
    loading: false,
    error: null,

    fetchSummary: async () => {
        set({ loading: true });
        try {
            const summary = await businessService.getFinancialSummary();
            set({ summary, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchExpenses: async () => {
        set({ loading: true });
        try {
            const expenses = await businessService.getExpenses();
            set({ expenses, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addExpense: async (expenseData) => {
        set({ loading: true });
        try {
            await businessService.logExpense(expenseData);
            const expenses = await businessService.getExpenses();
            set({ expenses, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchSettlements: async () => {
        set({ loading: true });
        try {
            const settlements = await businessService.getSettlements();
            set({ settlements, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchCashFlow: async () => {
        set({ loading: true });
        try {
            const data = await businessService.getCashFlow();
            set({ cashFlow: data, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchRefunds: async () => {
        set({ loading: true });
        try {
            const data = await businessService.getRefundsLosses();
            set({ refunds: data, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchAnalytics: async () => {
        set({ loading: true });
        try {
            const summary = await businessService.getFinancialSummary();
            set({ summary, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchWallet: async () => {
        set({ loading: true });
        try {
            const wallet = await businessService.getBusinessWallet();
            set({ wallet, loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    }
}));
