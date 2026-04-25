import { create } from 'zustand';
import * as adminService from '../../services/admin/adminService';

interface AdminState {
    stats: any | null;
    loadingStats: boolean;
    error: string | null;

    fetchDashboardStats: (days?: number) => Promise<void>;
    
    // Quick Operational Counts
    pendingKycCount: number;
    pendingWithdrawalsCount: number;
    failedTxsToday: number;
    todayProfit: number;
}

export const useAdminStore = create<AdminState>((set) => ({
    stats: null,
    loadingStats: false,
    error: null,
    pendingKycCount: 0,
    pendingWithdrawalsCount: 0,
    failedTxsToday: 0,
    todayProfit: 0,

    fetchDashboardStats: async (days = 7) => {
        set({ loadingStats: true, error: null });
        try {
            const response = await adminService.fetchDashboardStats(days);
            const data = response.data; // Backend returns { success: true, data: { ... } }
            
            set({ 
                stats: data, 
                pendingKycCount: data?.pendingKyc || 0,
                pendingWithdrawalsCount: data?.pendingWithdrawals || 0,
                failedTxsToday: data?.failedTxsToday || 0,
                todayProfit: data?.todayProfit || 0,
                loadingStats: false 
            });
        } catch (err: any) {
            set({ error: err.message, loadingStats: false });
        }
    },
}));
