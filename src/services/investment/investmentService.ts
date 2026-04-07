import api from '../api/apiClient';

export interface InvestmentSummary {
    isShareholder: boolean;
    sharesOwned: number;
    frozenShares: number;
    availableShares: number;
    dividendBalance: number;
    referralBalance: number;
    totalDividendsEarned: number;
    firstSharePurchasedAt: string | null;
    lockExpiresAt: string | null;
    canExit: boolean;
    settings: {
        sharePrice: number;
        maxSharesPerUser: number;
        sharesRemaining: number;
        investorAllocationPercent: number;
        dividendWithdrawalFee: number;
        dividendReinvestFee: number;
        dividendRedeemFee: number;
        shareLockPeriodMonths: number;
        shareExitFee: number;
        investmentEnabled: boolean;
    };
}

export const fetchInvestmentSummary = () => api.get('/investment/summary');
export const buyShares = (qty: number) => api.post('/investment/buy', { qty });
export const requestShareExit = (qty: number) => api.post('/investment/exit', { qty });
export const reinvestDividends = (qty: number) => api.post('/investment/reinvest', { qty });
export const redeemToMainWallet = (amount: number, source: 'dividend' | 'referral' = 'dividend') => 
    api.post('/investment/redeem', { amount, source });
export const requestDividendWithdrawal = (data: { amount: number; bankName: string; accountNumber: string; accountName: string; source?: 'dividend' | 'referral' }) => 
    api.post('/investment/withdraw', data);
export const fetchInvestmentHistory = (page = 1, limit = 20) => 
    api.get(`/investment/history?page=${page}&limit=${limit}`);
