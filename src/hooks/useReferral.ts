import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as referralService from '../services/referral/referralService';
import { toast } from 'react-toastify';

export const useReferralData = () => {
    return useQuery({
        queryKey: ['referral-stats'],
        queryFn: referralService.getReferralStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRedeemEarnings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ amount, pin }: { amount: number; pin: string }) => 
            referralService.redeemEarnings(amount, pin),
        onSuccess: (data) => {
            toast.success(data.message || 'Earnings redeemed successfully');
            queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to redeem earnings';
            toast.error(msg);
        }
    });
};
