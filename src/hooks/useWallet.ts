// src/hooks/useWallet.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletBalance, getWalletBalance, initPaystackServer } from "../services/wallet/walletService";
import { getMyTransactionLogs } from "../services/transactions/transactionService";

/** ---- Types (adjust/extend as needed) ---- */
export type Tx = {
    id: string;
    refId?: string;
    type: "wallet_fund" | "airtime" | "data" | "electricity" | "cable" | "exam_pin" | string;
    status: "pending" | "success" | "failed";
    amount: number;          // In NGN (not kobo)
    service?: string;        // e.g. Paystack
    currency?: string;       // default NGN
    createdAt: string;       // ISO string
    _orig?: any;             // keep original just in case (debug/receipt)
};

export type TxResult = {
    items: Tx[];
    total?: number;
    page?: number;
    limit?: number;
};

/** ---- Helpers ---- */
function normalizeTxArray(arr: any[]): Tx[] {
    return (arr ?? []).map((x: any): Tx => ({
        id: x.id ?? x._id ?? x.refId ?? x.reference ?? crypto?.randomUUID?.() ?? String(Math.random()),
        refId: x.refId ?? x.reference ?? x.ref ?? x.requestId,
        type: (x.type === "funding" ? "wallet_fund" : x.type) ?? "transaction",
        status: (x.status as Tx["status"]) ?? "pending",
        // Prefer top-level amount (already NGN). If only response.amount exists (kobo), convert.
        amount: typeof x.amount === "number"
            ? x.amount
            : typeof x?.response?.amount === "number"
                ? Math.round(x.response.amount / 100)
                : 0,
        service: x.service ?? x.response?.channel ?? undefined,
        currency: x.currency ?? x.response?.currency ?? "NGN",
        createdAt: x.createdAt ?? x.response?.createdAt ?? x.response?.transaction_date ?? new Date().toISOString(),
        _orig: x,
    }));
}

function normalizeTxResult(raw: any): TxResult {
    // Accept: array OR {items:[]} OR {data:[]}
    const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
                ? raw.data
                : [];

    const items = normalizeTxArray(arr);
    return {
        items,
        total: typeof raw?.total === "number" ? raw.total : items.length,
        page: typeof raw?.page === "number" ? raw.page : 1,
        limit: typeof raw?.limit === "number" ? raw.limit : items.length,
    };
}

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
            // getMyTransactionLogs may already return a normalized object OR raw axios data
            const res = await getMyTransactionLogs(params);
            // If it already looks like our shape, keep it; else normalize.
            const looksNormalized =
                res && typeof res === "object" && Array.isArray((res as any).items);

            if (looksNormalized) return res as TxResult;

            // If it was an axios response, use .data
            const raw = (res && typeof res === "object" && "data" in (res as any))
                ? (res as any).data
                : res;

            return normalizeTxResult(raw);
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