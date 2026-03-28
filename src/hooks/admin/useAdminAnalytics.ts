import { useQuery } from "@tanstack/react-query";
import { getAdminEarningsAnalytics } from "../../services/admin/adminAnalyticsService";

/**
 * Hook for platform-wide earnings analytics (Admin only)
 */
export const useAdminEarnings = () => {
    return useQuery({
        queryKey: ["admin", "earnings", "analytics"],
        queryFn: getAdminEarningsAnalytics,
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000,
    });
};
