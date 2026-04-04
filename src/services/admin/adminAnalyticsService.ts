import apiClient from "../api/apiClient";

const BASE_URL = "/admin/stats/admin";

/**
 * Admin Analytics Service for Earnings & Commission Insights
 */
export const getAdminEarningsAnalytics = async () => {
    const response = await apiClient.get(`${BASE_URL}/earnings`);
    return response.data;
};
