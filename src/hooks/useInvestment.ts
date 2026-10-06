import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as investmentService from '../services/investment/investmentService';
import { privateQueryKey } from '../app/queryClient';
import { usePrivateQueryContext } from './usePrivateQueryContext';
import {
    isPublicShareholdingAvailable,
    PUBLIC_SHAREHOLDING_KYC_HOLD,
} from '../utils/publicFeatureAvailability';

const useSecureInvestmentMutation = <TRequest, TResponse>(
    key: string,
    request: (data: TRequest) => Promise<TResponse>,
    invalidateWallet = false,
) => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    const pendingRequest = useRef<(() => Promise<TResponse>) | null>(null);
    const requestInFlight = useRef(false);
    const mutation = useMutation({
        mutationKey: privateQueryKey(userId, key),
        mutationFn: () => {
            const execute = pendingRequest.current;
            pendingRequest.current = null;
            if (!execute) return Promise.reject(new Error('Shareholding request is unavailable'));
            return execute();
        },
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'investment-summary') });
            if (invalidateWallet) {
                queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'wallet', 'balance') });
            }
        },
        onSettled: () => {
            pendingRequest.current = null;
            requestInFlight.current = false;
        },
    });

    const mutate = (data: TRequest, options?: Parameters<typeof mutation.mutate>[1]) => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        pendingRequest.current = () => request(data);
        mutation.mutate(undefined, options);
    };

    return { ...mutation, mutate };
};

export const useInvestmentSummary = (enabled = true) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'investment-summary'),
        queryFn: () => investmentService.fetchInvestmentSummary().then(res => res.data.data),
        enabled: isAuthenticated && enabled,
        refetchInterval: 60000, // Refresh every minute
    });
};

export const usePublicShareholdingAvailability = (enabled = true) => {
    const shouldLoadSummary = enabled && !PUBLIC_SHAREHOLDING_KYC_HOLD;
    const summary = useInvestmentSummary(shouldLoadSummary);

    return {
        isAvailable: enabled && isPublicShareholdingAvailable(summary.data?.settings?.investmentEnabled),
        isLoading: shouldLoadSummary && summary.isLoading,
    };
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
    return useSecureInvestmentMutation('buy-shares', investmentService.buyShares, true);
};

export const useReinvestDividends = () => {
    return useSecureInvestmentMutation('reinvest-dividends', investmentService.reinvestDividends);
};

export const useRedeemToMainWallet = () => {
    return useSecureInvestmentMutation('redeem-to-main-wallet', investmentService.redeemToMainWallet, true);
};

export const useRequestDividendWithdrawal = () => {
    return useSecureInvestmentMutation('dividend-withdrawal', investmentService.requestDividendWithdrawal);
};

export const useRequestShareExit = () => {
    return useSecureInvestmentMutation('share-exit', investmentService.requestShareExit);
};
