// src/hooks/useWallet.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletBalance, getWalletBalance, initPaystackServer } from "../services/wallet/walletService";
import { getMyTransactionLogs } from "../services/transactions/transactionService";

import type { TxLog } from "../services/transactions/transactionService";

export type TxResult = {
    items: TxLog[];
    total?: number;
    page?: number;
    limit?: number;
};

/** ---- Wallet balance ---- */
export function useWallet() {
    return useQuery({
        queryKey: ["wallet", "balance"],
        queryFn: getWalletBalance,
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
    return useQuery<TxResult>({
        queryKey: ["txlogs", params],
        queryFn: async () => {
            // Assuming getMyTransactionLogs returns { items: TxLog[], total, page, limit } already
            return await getMyTransactionLogs(params);
        },
        refetchOnWindowFocus: false,
        staleTime: 15_000,
    });
}

/** ---- Paystack init (invalidate wallet + tx logs on success) ---- */
export function useInitPaystackServer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => initPaystackServer(amount),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
            await qc.invalidateQueries({ queryKey: ["txlogs"] }); // invalidate all tx queries
        },
    });
}