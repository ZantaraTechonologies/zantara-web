import apiClient from "../api/apiClient";

const BASE_URL = "/admin/business";

export interface Expense {
    _id: string;
    title: string;
    amount: number;
    category: string;
    vendor?: string;
    paymentSource?: string;
    notes?: string;
    date: string;
}

export interface Settlement {
    _id: string;
    provider: string;
    amount: number;
    costPrice: number;
    profit: number;
    transactionId?: string;
    status: string;
    date: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number;
    totalExpenses: number;
    reservedPayouts: number;
    escrowFlow: number;
    recentActivities: any[];
}

/**
 * Business Service for Financial Analytics & Operations
 */
const businessService = {
    getFinancialSummary: async (): Promise<FinancialSummary> => {
        const response = await apiClient.get(`${BASE_URL}/overview`);
        return response.data;
    },

    getBusinessWallet: async () => {
        const response = await apiClient.get(`${BASE_URL}/wallet`);
        return response.data;
    },

    getCostLedger: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/cost-ledger`, { params });
        return response.data;
    },

    getExpenses: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/expenses`, { params });
        return response.data;
    },

    getSettlements: async () => {
        const response = await apiClient.get(`${BASE_URL}/settlements`);
        return response.data;
    },

    getCashFlow: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/cash-flow`, { params });
        return response.data;
    },

    getRefundsLosses: async () => {
        const response = await apiClient.get(`${BASE_URL}/refunds-losses`);
        return response.data;
    },

    logExpense: async (expenseData: Omit<Expense, '_id' | 'date'>) => {
        const response = await apiClient.get(`${BASE_URL}/expenses/log`, { params: expenseData });
        return response.data;
    }
};

export default businessService;
