import apiClient from "../api/apiClient";

const BASE_URL = "/admin/business";

/**
 * Admin Business & Finance Service
 */
export const getBusinessOverview = async (params: any = {}) => {
    const response = await apiClient.get(`${BASE_URL}/overview`, { params });
    return response.data;
};

export const getBusinessWallet = async () => {
    const response = await apiClient.get(`${BASE_URL}/wallet`);
    return response.data;
};

export const getCostLedger = async (params: any = {}) => {
    const response = await apiClient.get(`${BASE_URL}/cost-ledger`, { params });
    return response.data;
};

export const getProfitAnalytics = async () => {
    const response = await apiClient.get(`${BASE_URL}/profit`);
    return response.data;
};

export const getExpenses = async (params: any = {}) => {
    const response = await apiClient.get(`${BASE_URL}/expenses`, { params });
    return response.data;
};

export const createExpense = async (data: any) => {
    const response = await apiClient.post(`${BASE_URL}/expenses`, data);
    return response.data;
};

export const getRefundsLosses = async () => {
    const response = await apiClient.get(`${BASE_URL}/refunds-losses`);
    return response.data;
};

export const getSystemStatus = async () => {
    const response = await apiClient.get(`/admin/system/status`);
    return response.data;
};

// --- Commission & Agent Settings ---

export const getCommissionSettings = async () => {
    const response = await apiClient.get(`/admin/settings/commission`);
    return response.data;
};

export const updateCommissionSettings = async (data: any) => {
    const response = await apiClient.put(`/admin/settings/commission`, data);
    return response.data;
};

export const getAgentSettings = async () => {
    const response = await apiClient.get(`/admin/settings/agent`);
    return response.data;
};

export const updateAgentSettings = async (data: any) => {
    const response = await apiClient.put(`/admin/settings/agent`, data);
    return response.data;
};

export const getCommissionCaps = async () => {
    const response = await apiClient.get(`/admin/settings/commission-caps`);
    return response.data;
};

export const updateCommissionCaps = async (data: any) => {
    const response = await apiClient.put(`/admin/settings/commission-caps`, data);
    return response.data;
};

export const updateUserCommissionRate = async (userId: string, data: any) => {
    const response = await apiClient.put(`/admin/users/${userId}/commission-rate`, data);
    return response.data;
};

export const updateUserAgentDiscount = async (userId: string, data: any) => {
    const response = await apiClient.put(`/admin/users/${userId}/agent-discount`, data);
    return response.data;
};

// --- System & Investment Settings ---

export const getSystemSettings = async () => {
    const response = await apiClient.get(`/admin/settings`);
    return response.data;
};

export const updateSystemSettings = async (data: any) => {
    const response = await apiClient.post(`/admin/settings`, data);
    return response.data;
};
