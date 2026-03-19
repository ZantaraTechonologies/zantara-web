import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../services/notifications/notificationService';
import { toast } from 'react-toastify';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['my-notifications'],
        queryFn: notificationService.getMyNotifications,
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
        }
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            toast.success('All notifications marked as read');
            queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
        }
    });
};
