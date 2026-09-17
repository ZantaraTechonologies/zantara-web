// src/hooks/useWallet.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletBalance, getWalletBalance, initWalletFunding } from "../services/wallet/walletService";
import { getMyTransactionLogs, getTransactionById } from "../services/transactions/transactionService";
import { privateQueryKey } from "../app/queryClient";
import { usePrivateQueryContext } from "./usePrivateQueryContext";

import type { TxLog } from "../services/transactions/transactionService";

export type TxResult = {
    items: TxLog[];
    total?: number;
    page?: number;
    limit?: number;
};

/** ---- Wallet balance ---- */
export function useWallet() {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery({
        queryKey: privateQueryKey(userId, "wallet", "balance"),
        queryFn: getWalletBalance,
        enabled: isAuthenticated,
        refetchOnWindowFocus: false,
    });
}

/** ---- My transactions ---- */
export function useMyTransactions(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    refId?: string;
}) {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery<TxResult>({
        queryKey: privateQueryKey(userId, "txlogs", params),
        queryFn: async () => {
            // Assuming getMyTransactionLogs returns { items: TxLog[], total, page, limit } already
            return await getMyTransactionLogs(params);
        },
        enabled: isAuthenticated,
        refetchOnWindowFocus: false,
        staleTime: 15_000,
    });
}

/** ---- Single transaction details ---- */
export function useTransactionDetails(id: string | undefined) {
    const { userId, isAuthenticated } = usePrivateQueryContext();
    return useQuery<TxLog | null>({
        queryKey: privateQueryKey(userId, "txlog", id),
        queryFn: () => id ? getTransactionById(id) : Promise.resolve(null),
        enabled: isAuthenticated && !!id,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
    });
}

/** ---- Paystack init (invalidate wallet + tx logs on success) ---- */
export function useInitPaystackServer() {
    const qc = useQueryClient();
    const { userId } = usePrivateQueryContext();
    return useMutation({
        mutationKey: privateQueryKey(userId, "wallet", "fund"),
        mutationFn: (amount: number) => initWalletFunding(amount),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: privateQueryKey(userId, "wallet", "balance") });
            await qc.invalidateQueries({ queryKey: privateQueryKey(userId, "txlogs") });
        },
    });
}
