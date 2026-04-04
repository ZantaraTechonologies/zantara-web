import apiClient from '../api/apiClient';

const BASE_URL = '/admin/notifications';

export const fetchAdminNotifications = async () => {
    const response = await apiClient.get(`${BASE_URL}/broadcasts`);
    return response.data;
};

export const sendBroadcast = async (data: { title: string; message: string; type?: string; target?: string }) => {
    const response = await apiClient.post(`${BASE_URL}/broadcast`, data);
    return response.data;
};

export const deleteBroadcast = async (id: string) => {
    const response = await apiClient.delete(`${BASE_URL}/broadcast/${id}`);
    return response.data;
};

export const toggleBroadcastStatus = async (id: string) => {
    const response = await apiClient.post(`${BASE_URL}/broadcast/${id}/toggle`);
    return response.data;
};
