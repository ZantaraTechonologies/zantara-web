import API from '../api/apiClient';

export interface ReferralStats {
    referralBalance: number;
    totalReferralBonus: number;
    myReferralCode: string;
    totalReferrals?: number;
}

export interface EarningsSummary {
    totalEarnings: number;
    referralEarnings: number;
    agentProfit: number;
    totalReferrals: number;
    referralBalance: number;
    cappedCommissionsCount: number;
    skippedCommissionsCount: number;
}

export interface EarningsHistoryItem {
    id: string;
    type: 'referral_bonus' | 'agent_profit' | 'referral_skipped' | 'referral_redeem';
    amount: number;
    refId: string;
    transactionId?: string;
    wasCapped?: boolean;
    buyerRole?: string;
    status: string;
    createdAt: string;
    metadata?: any;
}

export interface EarningsHistoryResponse {
    success: boolean;
    data: EarningsHistoryItem[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface RedeemResponse {
    success: boolean;
    message: string;
    newBalance: number;
}

export const getReferralStats = async (): Promise<ReferralStats> => {
    const { data } = await API.get('/auth/me');
    return {
        referralBalance: data.referralBalance || 0,
        totalReferralBonus: data.totalReferralBonus || 0,
        myReferralCode: data.myReferralCode || '',
        totalReferrals: data.totalReferrals || 0,
    };
};

export const getEarningsSummary = async (): Promise<EarningsSummary> => {
    const { data } = await API.get('/user/earnings/summary');
    return data;
};

export const getEarningsHistory = async (page = 1, limit = 10): Promise<EarningsHistoryResponse> => {
    const { data } = await API.get(`/user/earnings/history?page=${page}&limit=${limit}`);
    return data;
};

export const redeemEarnings = async (amount: number, pin: string): Promise<RedeemResponse> => {
    const { data } = await API.post('/wallet/redeem-earnings', { amount, pin });
    return data;
};
