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

export interface BuySharesRequest {
    qty: number;
    pin: string;
}

export interface ShareExitRequest {
    qty: number;
    pin: string;
}

export interface ReinvestDividendsRequest {
    qty: number;
    pin: string;
}

export interface RedeemInvestmentRequest {
    amount: number;
    source: 'dividend' | 'referral';
    pin: string;
}

export interface InvestmentWithdrawalRequest {
    amount: number;
    source: 'dividend' | 'referral';
    bankName: string;
    accountNumber: string;
    accountName: string;
    pin: string;
}

export const fetchInvestmentSummary = () => api.get('/investment/summary');
export const buyShares = (data: BuySharesRequest) => api.post('/investment/buy', data);
export const requestShareExit = (data: ShareExitRequest) => api.post('/investment/exit', data);
export const reinvestDividends = (data: ReinvestDividendsRequest) => api.post('/investment/reinvest', data);
export const redeemToMainWallet = (data: RedeemInvestmentRequest) => api.post('/investment/redeem', data);
export const requestDividendWithdrawal = (data: InvestmentWithdrawalRequest) => api.post('/investment/withdraw', data);
export const fetchInvestmentHistory = (page = 1, limit = 20) => 
    api.get(`/investment/history?page=${page}&limit=${limit}`);
