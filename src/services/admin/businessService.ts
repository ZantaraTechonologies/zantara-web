import apiClient from "../api/apiClient";

const BASE_URL = "/admin/business";

/**
 * Business Service for Financial Analytics & Operations
 */
export const fetchBusinessOverview = async () => {
    const response = await apiClient.get(`${BASE_URL}/overview`);
    return response.data;
};

export const fetchBusinessWallet = async () => {
    const response = await apiClient.get(`${BASE_URL}/wallet`);
    return response.data;
};

export const fetchCostLedger = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/cost-ledger`, { params });
    return response.data;
};

export const fetchExpenses = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/expenses`, { params });
    return response.data;
};

export const fetchProfitAnalytics = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/profit-analytics`, { params });
    return response.data;
};

export const fetchSettlements = async () => {
    const response = await apiClient.get(`${BASE_URL}/settlements`);
    return response.data;
};

export const fetchCashFlow = async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/cash-flow`, { params });
    return response.data;
};
