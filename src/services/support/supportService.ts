import API from '../api/apiClient';

export interface TicketResponse {
    sender: string;
    message: string;
    createdAt: string;
}

export interface Ticket {
    _id: string;
    userId: string | any;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    transactionId?: string;
    responses: TicketResponse[];
    createdAt: string;
    updatedAt: string;
}

export const createTicket = async (ticketData: {
    subject: string;
    message: string;
    priority: string;
    transactionId?: string;
}): Promise<Ticket> => {
    const { data } = await API.post('/support/create', ticketData);
    return data.data;
};

export const getMyTickets = async (): Promise<Ticket[]> => {
    const { data } = await API.get('/support/my-tickets');
    return data.data;
};

export const replyToTicket = async (id: string, message: string): Promise<Ticket> => {
    const { data } = await API.post(`/support/reply/${id}`, { message });
    return data.data;
};

export const getTicketById = async (id: string): Promise<Ticket> => {
    // In this backend, getMyTickets returns all. We can filter locally or if there was a specific GET /support/:id
    // But typically we fetch all and find the one. Let's assume we fetch all for now or the backend has a direct GET.
    const { data } = await API.get('/support/my-tickets');
    return data.data.find((t: any) => t._id === id);
};
