import apiClient from "../api/apiClient";

const BASE_URL = "/admin";

/**
 * Admin Service for Core Operations
 */
export const fetchDashboardStats = async () => {
    const response = await apiClient.get(`${BASE_URL}/stats/dashboard`);
    return response.data;
};

export const fetchUsers = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/users`, { params });
    return response.data;
};

export const fetchUserDetails = async (id: string) => {
    const response = await apiClient.get(`${BASE_URL}/users/${id}`);
    return response.data;
};

export const fetchKycQueue = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/kyc/queue`, { params });
    return response.data;
};

export const approveKyc = async (id: string, notes: string) => {
    const response = await apiClient.post(`${BASE_URL}/kyc/approve/${id}`, { notes });
    return response.data;
};

export const rejectKyc = async (id: string, reason: string) => {
    const response = await apiClient.post(`${BASE_URL}/kyc/reject/${id}`, { reason });
    return response.data;
};

export const fetchAllTransactions = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/transactions`, { params });
    return response.data;
};

export const fetchWithdrawals = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/withdrawals`, { params });
    return response.data;
};

export const processWithdrawal = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    const response = await apiClient.post(`${BASE_URL}/withdrawals/${id}/process`, { action, reason });
    return response.data;
};

export const fetchAuditLogs = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/audit-logs`, { params });
    return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
    const response = await apiClient.put(`${BASE_URL}/users/${id}`, { role });
    return response.data;
};

export const blockUser = async (id: string, isBlocked: boolean) => {
    const response = await apiClient.put(`${BASE_URL}/users/${id}`, { status: isBlocked });
    return response.data;
};
