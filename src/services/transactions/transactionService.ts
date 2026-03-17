import API from "../api/apiClient";

export type TxLog = {
    id: string;
    refId?: string;
    type: "wallet_fund" | "airtime" | "data" | "electricity" | "cable" | "exam_pin" | string;
    status: "pending" | "success" | "failed";
    amount: number;
    service?: string;
    currency?: string;
    createdAt: string;
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
        service: x.service ?? x.response?.channel ?? undefined,
        currency: x.response?.currency ?? "NGN",
        createdAt: x.createdAt ?? x.response?.createdAt ?? x.response?.transaction_date,
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
