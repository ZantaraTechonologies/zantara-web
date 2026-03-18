import API from '../../../services/api/apiClient';

export interface FinancialSummary {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalExpenses: number;
    netProfit: number;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: 'manual' | 'operational';
    date: string;
}

export interface Settlement {
    id: string;
    provider: string;
    amount: number;
    status: 'pending' | 'completed';
    date: string;
}

export interface BusinessService {
    getFinancialSummary: () => Promise<FinancialSummary>;
    getExpenses: () => Promise<Expense[]>;
    logExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<Expense>;
    getSettlements: () => Promise<Settlement[]>;
    getProfitAnalytics: () => Promise<any>;
    getCostLedger: () => Promise<any[]>;
    getCashFlow: () => Promise<any>;
    getRefundsLosses: () => Promise<any>;
}

const businessService: BusinessService = {
    getFinancialSummary: async () => {
        const res = await API.get('/business/summary');
        return res.data;
    },
    getExpenses: async () => {
        const res = await API.get('/business/expenses');
        return res.data;
    },
    logExpense: async (expense) => {
        const res = await API.post('/business/expenses', expense);
        return res.data;
    },
    getSettlements: async () => {
        const res = await API.get('/business/settlements');
        return res.data;
    },
    getProfitAnalytics: async () => {
        const res = await API.get('/business/profit-analytics');
        return res.data;
    },
    getCostLedger: async () => {
        const res = await API.get('/business/cost-ledger');
        return res.data;
    },
    getCashFlow: async () => {
        const res = await API.get('/business/cash-flow');
        return res.data;
    },
    getRefundsLosses: async () => {
        const res = await API.get('/business/refunds-losses');
        return res.data;
    }
};

export default businessService;
