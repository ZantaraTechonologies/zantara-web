import { useQuery } from "@tanstack/react-query";
import { getAdminEarningsAnalytics } from "../../services/admin/adminAnalyticsService";

/**
 * Hook for platform-wide earnings analytics (Admin only)
 */
export const useAdminEarnings = (params?: any) => {
    return useQuery({
        queryKey: ["admin", "earnings", "analytics", params],
        queryFn: () => getAdminEarningsAnalytics(params),
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000,
    });
};
