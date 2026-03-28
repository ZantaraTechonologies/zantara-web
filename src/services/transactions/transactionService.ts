import API from "../api/apiClient";

export type TxLog = {
    id: string;
    refId?: string;
    type: "wallet_fund" | "airtime" | "data" | "electricity" | "cable" | "exam_pin" | string;
    status: "pending" | "success" | "failed" | "skipped";
    amount: number;
    costPrice?: number;
    profit?: number;
    salePrice?: number;
    agentPrice?: number;
    service?: string;
    currency?: string;
    createdAt: string;
    // Transparency fields (Step 10)
    wasCapped?: boolean;
    buyerRole?: string;
    originalCommission?: number;
    details?: any;
    metadata?: any;
};

export async function getMyTransactionLogs(params?: {
    refId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    // 1) Make sure this matches your backend route
    const res = await API.get("/transaction-logs", { params }); // <-- plural 'transactions'
    const raw = res?.data;

    // 2) Accept array, {items}, or {data}
    const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
                ? raw.data
                : [];

    // 3) Map backend fields to your TxLog shape
    const items: TxLog[] = arr.map((x: any): TxLog => ({
        id: x._id ?? x.id,
        refId: x.refId,
        // map "funding" from backend to your enum "wallet_fund"
        type: (x.type === "funding" ? "wallet_fund" : x.type) as TxLog["type"],
        status: x.status,
        amount: x.amount, // already NGN units in your DB
        costPrice: x.costPrice,
        profit: x.profit ?? (x.amount && x.costPrice ? x.amount - x.costPrice : undefined),
        salePrice: x.salePrice,
        agentPrice: x.agentPrice,
        service: x.service ?? x.response?.channel ?? undefined,
        currency: x.response?.currency ?? "NGN",
        createdAt: x.createdAt ?? x.response?.createdAt ?? x.response?.transaction_date,
        // Transparency mapping
        wasCapped: x.wasCapped ?? x.details?.wasCapped,
        buyerRole: x.buyerRole ?? x.details?.buyerRole,
        originalCommission: x.originalCommission ?? x.details?.originalCommission,
        details: x.details,
        metadata: x.metadata
    }));

    // 4) Derive meta if missing
    const total =
        typeof raw?.total === "number" ? raw.total : items.length;
    const page =
        typeof raw?.page === "number" ? raw.page : 1;
    const limit =
        typeof raw?.limit === "number" ? raw.limit : items.length;

    return { items, total, page, limit };
}

export async function getTransactionById(id: string): Promise<TxLog | null> {
    try {
        const res = await API.get(`/transaction-logs/${id}`);
        const x = res?.data;
        if (!x) return null;

        return {
            id: x._id ?? x.id,
            refId: x.refId,
            type: (x.type === "funding" ? "wallet_fund" : x.type) as TxLog["type"],
            status: x.status,
            amount: x.amount,
            costPrice: x.costPrice,
            profit: x.profit ?? (x.amount && x.costPrice ? x.amount - x.costPrice : undefined),
            salePrice: x.salePrice,
            agentPrice: x.agentPrice,
            service: x.service ?? x.response?.channel ?? undefined,
            currency: x.response?.currency ?? "NGN",
            createdAt: x.createdAt ?? x.response?.createdAt ?? x.response?.transaction_date,
            // Transparency mapping
            wasCapped: x.wasCapped ?? x.details?.wasCapped,
            buyerRole: x.buyerRole ?? x.details?.buyerRole,
            originalCommission: x.originalCommission ?? x.details?.originalCommission,
            details: x.details,
            metadata: x.metadata
        };
    } catch (err) {
        console.error("Failed to fetch transaction details", err);
        return null;
    }
}
