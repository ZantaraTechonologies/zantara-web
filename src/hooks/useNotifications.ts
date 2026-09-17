import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../services/notifications/notificationService';
import { toast } from 'react-toastify';
import { privateQueryKey } from '../app/queryClient';
import { usePrivateQueryContext } from './usePrivateQueryContext';

export const useNotifications = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'my-notifications'),
        queryFn: notificationService.getMyNotifications,
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();

    return useMutation({
        mutationKey: privateQueryKey(userId, 'mark-notification-read'),
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'my-notifications') });
        }
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();

    return useMutation({
        mutationKey: privateQueryKey(userId, 'mark-all-notifications-read'),
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            toast.success('All notifications marked as read');
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'my-notifications') });
        }
    });
};
