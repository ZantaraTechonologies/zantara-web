import apiClient from "../api/apiClient";

const BASE_URL = "/admin/stats/admin";

/**
 * Admin Analytics Service for Earnings & Commission Insights
 */
export const getAdminEarningsAnalytics = async (params?: any) => {
    const response = await apiClient.get(`${BASE_URL}/earnings`, { params });
    return response.data;
};
