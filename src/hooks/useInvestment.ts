import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as investmentService from '../services/investment/investmentService';

export const useInvestmentSummary = () => {
    return useQuery({
        queryKey: ['investment-summary'],
        queryFn: () => investmentService.fetchInvestmentSummary().then(res => res.data.data),
        refetchInterval: 60000, // Refresh every minute
    });
};

export const useInvestmentHistory = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['investment-history', page, limit],
        queryFn: () => investmentService.fetchInvestmentHistory(page, limit).then(res => res.data),
    });
};

export const useBuyShares = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (qty: number) => investmentService.buyShares(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
        },
    });
};

export const useReinvestDividends = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (qty: number) => investmentService.reinvestDividends(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
        },
    });
};

export const useRedeemToMainWallet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => investmentService.redeemToMainWallet(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
        },
    });
};

export const useRequestDividendWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { amount: number; bankName: string; accountNumber: string; accountName: string }) => 
            investmentService.requestDividendWithdrawal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
        },
    });
};

export const useRequestShareExit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (qty: number) => investmentService.requestShareExit(qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
        },
    });
};
