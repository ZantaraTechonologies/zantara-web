import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as supportService from '../services/support/supportService';
import { toast } from 'react-hot-toast';

export const useMyTickets = () => {
    return useQuery({
        queryKey: ['my-tickets'],
        queryFn: supportService.getMyTickets,
    });
};

export const useTicketDetails = (id: string) => {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => supportService.getTicketById(id),
        enabled: !!id,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ticketData: any) => supportService.createTicket(ticketData),
        onSuccess: () => {
            toast.success('Support ticket created successfully');
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to create ticket';
            toast.error(msg);
        }
    });
};

export const useReplyToTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, message }: { id: string, message: string }) => 
            supportService.replyToTicket(id, message),
        onSuccess: (_, variables) => {
            toast.success('Reply transmitted');
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to send reply';
            toast.error(msg);
        }
    });
};
