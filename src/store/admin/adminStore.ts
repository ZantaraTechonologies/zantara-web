import { create } from 'zustand';
import * as adminService from '../../services/admin/adminService';

interface AdminState {
    stats: any | null;
    loadingStats: boolean;
    error: string | null;

    fetchDashboardStats: () => Promise<void>;
    
    // Quick Operational Counts
    pendingKycCount: number;
    pendingWithdrawalsCount: number;
    failedTxsToday: number;
}

export const useAdminStore = create<AdminState>((set) => ({
    stats: null,
    loadingStats: false,
    error: null,
    pendingKycCount: 0,
    pendingWithdrawalsCount: 0,
    failedTxsToday: 0,

    fetchDashboardStats: async () => {
        set({ loadingStats: true, error: null });
        try {
            const data = await adminService.fetchDashboardStats();
            set({ 
                stats: data, 
                pendingKycCount: data?.pendingKyc || 0,
                pendingWithdrawalsCount: data?.pendingWithdrawals || 0,
                failedTxsToday: data?.failedTxsToday || 0,
                loadingStats: false 
            });
        } catch (err: any) {
            set({ error: err.message, loadingStats: false });
        }
    },
}));
