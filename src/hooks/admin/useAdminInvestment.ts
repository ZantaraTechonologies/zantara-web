import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api/apiClient';
import { privateQueryKey } from '../../app/queryClient';
import { usePrivateQueryContext } from '../usePrivateQueryContext';

export const useAdminShareholderOverview = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'admin-shareholder-overview'),
        queryFn: () => api.get('/investment/admin/overview').then(res => res.data.data),
        enabled: isAuthenticated,
    });
};

export const useAdminShareholders = (page = 1, limit = 50) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'admin-shareholders', page, limit),
        queryFn: () => api.get(`/investment/admin/shareholders?page=${page}&limit=${limit}`).then(res => res.data),
        enabled: isAuthenticated,
    });
};

export const useAdminPendingExits = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'admin-pending-exits'),
        queryFn: () => api.get('/investment/admin/exits').then(res => res.data.data),
        enabled: isAuthenticated,
    });
};

export const useAdminProcessExit = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'admin-process-exit'),
        mutationFn: ({ id, action, adminNote }: { id: string; action: 'approved' | 'rejected'; adminNote?: string }) => 
            api.put(`/investment/admin/exits/${id}`, { action, adminNote }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-pending-exits') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-shareholder-overview') });
        },
    });
};

export const useAdminPendingDividendWithdrawals = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'admin-pending-dividend-withdrawals'),
        queryFn: () => api.get('/investment/admin/withdrawals').then(res => res.data.data),
        enabled: isAuthenticated,
    });
};

export const useAdminProcessDividendWithdrawal = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'admin-process-dividend-withdrawal'),
        mutationFn: ({ id, action, adminNote }: { id: string; action: 'approved' | 'rejected'; adminNote?: string }) => 
            api.put(`/investment/admin/withdrawals/${id}`, { action, adminNote }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-pending-dividend-withdrawals') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-shareholder-overview') });
        },
    });
};

export const useAdminUpdateInvestmentSettings = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'admin-update-investment-settings'),
        mutationFn: (settings: any) => api.put('/investment/admin/settings', settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-shareholder-overview') });
        },
    });
};

export const useAdminTriggerManualPayout = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, 'admin-trigger-payout'),
        mutationFn: () => api.post('/investment/admin/payout/trigger'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-shareholders') });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'admin-shareholder-overview') });
        },
    });
};
