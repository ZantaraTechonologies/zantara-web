import { create } from 'zustand';
import businessService, { FinancialSummary, Expense, Settlement } from '../services/businessService';

interface BusinessState {
    summary: FinancialSummary;
    expenses: Expense[];
    settlements: Settlement[];
    losses: any[];
    cashFlow: any;
    loading: boolean;
    error: string | null;

    fetchSummary: () => Promise<void>;
    fetchExpenses: () => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
    fetchSettlements: () => Promise<void>;
    fetchAnalytics: () => Promise<void>;
}

const initialSummary: FinancialSummary = {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalExpenses: 0,
    netProfit: 0
};

export const useBusinessStore = create<BusinessState>((set) => ({
    summary: initialSummary,
    expenses: [],
    settlements: [],
    losses: [],
    cashFlow: null,
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

    fetchAnalytics: async () => {
        set({ loading: true });
        try {
            const analytics = await businessService.getProfitAnalytics();
            // Handle analytics update here if needed
            set({ loading: false, error: null });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    }
}));
