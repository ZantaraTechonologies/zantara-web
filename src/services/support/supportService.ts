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
    category: string;
    transactionId?: string;
    responses: TicketResponse[];
    createdAt: string;
    updatedAt: string;
}

export const createTicket = async (ticketData: {
    subject: string;
    message: string;
    priority: string;
    category: string;
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
    const { data } = await API.get(`/support/ticket/${id}`);
    return data.data;
};

export const fetchAllTickets = async (params = {}): Promise<Ticket[]> => {
    const { data } = await API.get('/support/all', { params });
    return data.data;
};
