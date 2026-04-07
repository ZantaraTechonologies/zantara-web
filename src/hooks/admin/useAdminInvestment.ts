import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api/apiClient';

export const useAdminShareholderOverview = () => {
    return useQuery({
        queryKey: ['admin-shareholder-overview'],
        queryFn: () => api.get('/investment/admin/overview').then(res => res.data.data),
    });
};

export const useAdminShareholders = (page = 1, limit = 50) => {
    return useQuery({
        queryKey: ['admin-shareholders', page, limit],
        queryFn: () => api.get(`/investment/admin/shareholders?page=${page}&limit=${limit}`).then(res => res.data),
    });
};

export const useAdminPendingExits = () => {
    return useQuery({
        queryKey: ['admin-pending-exits'],
        queryFn: () => api.get('/investment/admin/exits').then(res => res.data.data),
    });
};

export const useAdminProcessExit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action, adminNote }: { id: string; action: 'approved' | 'rejected'; adminNote?: string }) => 
            api.put(`/investment/admin/exits/${id}`, { action, adminNote }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-exits'] });
            queryClient.invalidateQueries({ queryKey: ['admin-shareholder-overview'] });
        },
    });
};

export const useAdminPendingDividendWithdrawals = () => {
    return useQuery({
        queryKey: ['admin-pending-dividend-withdrawals'],
        queryFn: () => api.get('/investment/admin/withdrawals').then(res => res.data.data),
    });
};

export const useAdminProcessDividendWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action, adminNote }: { id: string; action: 'approved' | 'rejected'; adminNote?: string }) => 
            api.put(`/investment/admin/withdrawals/${id}`, { action, adminNote }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-dividend-withdrawals'] });
            queryClient.invalidateQueries({ queryKey: ['admin-shareholder-overview'] });
        },
    });
};

export const useAdminUpdateInvestmentSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: any) => api.put('/investment/admin/settings', settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shareholder-overview'] });
        },
    });
};

export const useAdminTriggerManualPayout = () => {
    return useMutation({
        mutationFn: () => api.post('/investment/admin/payout/trigger'),
    });
};
