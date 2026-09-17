import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as referralService from '../services/referral/referralService';
import { toast } from 'react-toastify';
import { privateQueryKey } from '../app/queryClient';
import { usePrivateQueryContext } from './usePrivateQueryContext';

export const useReferralData = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'referral-stats'),
        queryFn: referralService.getReferralStats,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useEarningsSummary = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'earnings-summary'),
        queryFn: referralService.getEarningsSummary,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useEarningsHistory = (page = 1, limit = 10) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'earnings-history', page, limit),
        queryFn: () => referralService.getEarningsHistory(page, limit),
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useRedeemEarnings = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();

    return useMutation({
        mutationKey: privateQueryKey(userId, 'redeem-earnings'),
        mutationFn: ({ amount, pin }: { amount: number; pin: string }) => 
            referralService.redeemEarnings(amount, pin),
        onSuccess: (data) => {
            toast.success(data.message || 'Earnings redeemed successfully');
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'referral-stats') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'wallet', 'balance') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'txlogs') });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to redeem earnings';
            toast.error(msg);
        }
    });
};
