import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportService from '../services/support/supportService';
import { toast } from 'react-hot-toast';
import { privateQueryKey } from '../app/queryClient';
import { usePrivateQueryContext } from './usePrivateQueryContext';

export const useMyTickets = () => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'my-tickets'),
        queryFn: supportService.getMyTickets,
        enabled: isAuthenticated,
    });
};

export const useTicketDetails = (id: string) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, 'ticket', id),
        queryFn: () => supportService.getTicketById(id),
        enabled: isAuthenticated && !!id,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();

    return useMutation({
        mutationKey: privateQueryKey(userId, 'create-ticket'),
        mutationFn: (ticketData: any) => supportService.createTicket(ticketData),
        onSuccess: () => {
            toast.success('Support ticket created successfully');
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'my-tickets') });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to create ticket';
            toast.error(msg);
        }
    });
};

export const useReplyToTicket = () => {
    const queryClient = useQueryClient();
    const { userId } = usePrivateQueryContext();

    return useMutation({
        mutationKey: privateQueryKey(userId, 'reply-ticket'),
        mutationFn: ({ id, message }: { id: string, message: string }) => 
            supportService.replyToTicket(id, message),
        onSuccess: (_, variables) => {
            toast.success('Reply transmitted');
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'ticket', variables.id) });
            queryClient.invalidateQueries({ queryKey: privateQueryKey(userId, 'my-tickets') });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to send reply';
            toast.error(msg);
        }
    });
};
