import apiClient from "../api/apiClient";

const BASE_URL = "/admin/business";

/**
 * Admin Business & Finance Service
 */
export const getBusinessOverview = async () => {
    const response = await apiClient.get(`${BASE_URL}/overview`);
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
