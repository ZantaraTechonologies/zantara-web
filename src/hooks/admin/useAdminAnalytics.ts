import { useQuery } from "@tanstack/react-query";
import { getAdminEarningsAnalytics } from "../../services/admin/adminAnalyticsService";
import { privateQueryKey } from "../../app/queryClient";
import { usePrivateQueryContext } from "../usePrivateQueryContext";

/**
 * Hook for platform-wide earnings analytics (Admin only)
 */
export const useAdminEarnings = (params?: any) => {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, "admin", "earnings", "analytics", params),
        queryFn: () => getAdminEarningsAnalytics(params),
        enabled: isAuthenticated,
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000,
    });
};
