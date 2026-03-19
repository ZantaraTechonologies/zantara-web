import API from '../../../services/api/apiClient';

export interface FinancialSummary {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    reservedPayouts: number;
    escrowFlow: number;
    recentActivities: any[];
}

export interface Expense {
    _id: string;
    category: string;
    title: string;
    amount: number;
    vendor?: string;
    date: string;
    paymentSource?: string;
    notes?: string;
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

export interface BusinessService {
    getFinancialSummary: () => Promise<FinancialSummary>;
    getExpenses: () => Promise<Expense[]>;
    logExpense: (expense: Omit<Expense, '_id' | 'date'>) => Promise<any>;
    getSettlements: () => Promise<Settlement[]>;
    getProfitAnalytics: () => Promise<FinancialSummary>;
    getCostLedger: () => Promise<any>;
    getCashFlow: () => Promise<any>;
    getRefundsLosses: () => Promise<any>;
    getBusinessWallet: () => Promise<any>;
}

const BASE_URL = '/admin/business';

const businessService: BusinessService = {
    getFinancialSummary: async () => {
        const res = await API.get(`${BASE_URL}/overview`);
        return res.data;
    },
    getExpenses: async () => {
        const res = await API.get(`${BASE_URL}/expenses`);
        return res.data;
    },
    logExpense: async (expense) => {
        const res = await API.get(`${BASE_URL}/expenses/log`, { params: expense });
        return res.data;
    },
    getSettlements: async () => {
        const res = await API.get(`${BASE_URL}/settlements`);
        return res.data;
    },
    getProfitAnalytics: async () => {
        const res = await API.get(`${BASE_URL}/overview`);
        return res.data;
    },
    getCostLedger: async () => {
        const res = await API.get(`${BASE_URL}/cost-ledger`);
        return res.data;
    },
    getCashFlow: async () => {
        const res = await API.get(`${BASE_URL}/cash-flow`);
        return res.data;
    },
    getRefundsLosses: async () => {
        const res = await API.get(`${BASE_URL}/refunds-losses`);
        return res.data;
    },
    getBusinessWallet: async () => {
        const res = await API.get(`${BASE_URL}/wallet`);
        return res.data;
    }
};

export default businessService;
