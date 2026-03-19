import API from '../api/apiClient';

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    metadata?: any;
    createdAt: string;
}

export const getMyNotifications = async (): Promise<Notification[]> => {
    const { data } = await API.get('/notification');
    return data.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await API.post(`/notification/read/${id}`);
};

export const markAllAsRead = async (): Promise<void> => {
    await API.post('/notification/read-all');
};
