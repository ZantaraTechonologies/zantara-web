import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as investmentService from '../services/investment/investmentService';
import { privateQueryKey } from '../app/queryClient';
import { usePrivateQueryContext } from './usePrivateQueryContext';

export const useInvestmentSummary = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'investment-summary'),
        queryFn: () => investmentService.fetchInvestmentSummary().then(res => res.data.data),
        enabled: isAuthenticated,
        refetchInterval: 60000, // Refresh every minute
    });
};

export const useInvestmentHistory = (page = 1, limit = 20) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'investment-history', page, limit),
        queryFn: () => investmentService.fetchInvestmentHistory(page, limit).then(res => res.data),
        enabled: isAuthenticated,
    });
};

export const useBuyShares = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'buy-shares'),
        mutationFn: (qty: number) => investmentService.buyShares(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'wallet', 'balance') });
        },
    });
};

export const useReinvestDividends = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'reinvest-dividends'),
        mutationFn: (qty: number) => investmentService.reinvestDividends(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
        },
    });
};

export const useRedeemToMainWallet = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'redeem-to-main-wallet'),
        mutationFn: ({ amount, source }: { amount: number; source: 'dividend' | 'referral' }) => 
            investmentService.redeemToMainWallet(amount, source),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'wallet', 'balance') });
        },
    });
};

export const useRequestDividendWithdrawal = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'dividend-withdrawal'),
        mutationFn: (data: { amount: number; bankName: string; accountNumber: string; accountName: string }) => 
            investmentService.requestDividendWithdrawal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
        },
    });
};

export const useRequestShareExit = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'share-exit'),
        mutationFn: (qty: number) => investmentService.requestShareExit(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
        },
    });
};
