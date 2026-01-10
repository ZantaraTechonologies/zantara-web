import API from "./axios";

export type WalletBalance = {
    balance: number;
    available: number;
    frozen: number;
    currency?: string;
};

export async function getWalletBalance(): Promise<WalletBalance> {
    const { data } = await API.get("/wallet");
    console.log(data)
    return data;
}

// export const getWalletBalance = async () => {
//   const { data } = await API.get("/wallet");
//   return data;
// };

/**
 * Backend helper (recommended):
 * - POST /payments/paystack/init  { amount }
 * -> { authorization_url, reference } (server creates ref and returns it)
 *
 * If you don't have this endpoint yet, see client-init below.
 */
export async function initPaystackServer(amount: number): Promise<{ authorization_url: string; reference: string }> {
    const { data } = await API.post("/payments/paystack/init", { amount });
    return data;
}
