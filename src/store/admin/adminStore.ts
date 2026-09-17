import { create } from 'zustand';
import * as adminService from '../../services/admin/adminService';
import { getSessionEpoch, isSessionEpochCurrent, registerSessionReset } from '../../app/sessionLifecycle';

const adminResetState = {
    stats: null,
    loadingStats: false,
    error: null,
    pendingKycCount: 0,
    pendingWithdrawalsCount: 0,
    failedTxsToday: 0,
    todayProfit: 0,
};

interface AdminState {
    stats: any | null;
    loadingStats: boolean;
    error: string | null;

    fetchDashboardStats: (days?: number) => Promise<void>;
    reset: () => void;
    
    // Quick Operational Counts
    pendingKycCount: number;
    pendingWithdrawalsCount: number;
    failedTxsToday: number;
    todayProfit: number;
}

export const useAdminStore = create<AdminState>((set) => ({
    ...adminResetState,

    fetchDashboardStats: async (days = 7) => {
        const epoch = getSessionEpoch();
        set({ loadingStats: true, error: null });
        try {
            const response = await adminService.fetchDashboardStats(days);
            if (!isSessionEpochCurrent(epoch)) return;
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
            if (!isSessionEpochCurrent(epoch)) return;
            set({ error: err.message, loadingStats: false });
        }
    },
    reset: () => set(adminResetState),
}));

registerSessionReset('admin', () => useAdminStore.getState().reset());
