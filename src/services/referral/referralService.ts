import API from '../api/apiClient';

export interface ReferralStats {
    referralBalance: number;
    totalReferralBonus: number;
    myReferralCode: string;
    totalReferrals?: number;
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
        totalReferrals: data.totalReferrals || 0, // Fallback even if backend doesn't provide it yet
    };
};

export const redeemEarnings = async (amount: number, pin: string): Promise<RedeemResponse> => {
    const { data } = await API.post('/wallet/redeem-earnings', { amount, pin });
    return data;
};
