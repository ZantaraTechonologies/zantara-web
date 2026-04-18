import API from "../api/apiClient";

export type WalletBalance = {
    balance: number;
    available: number;
    frozen: number;
    currency?: string;
};

export async function getWalletBalance(): Promise<WalletBalance> {
    const { data } = await API.get("/wallet");
    // Map backend {balance, frozen, currency} to frontend WalletBalance
    return {
        balance: (data.balance || 0) + (data.frozen || 0),
        available: data.balance || 0,
        frozen: data.frozen || 0,
        currency: data.currency || '₦'
    };
}

// Virtual accounts are part of the user profile, but we can keep this for abstraction
// if the authStore is already fetching 'me', we can just use that.
export async function getVirtualAccount(): Promise<any> {
    const { data } = await API.get("/auth/me");
    return data.virtualAccounts?.[0] || null;
}

export async function getLinkedAccounts(): Promise<any[]> {
    const { data } = await API.get("/bank-accounts");
    return data.data || data; // Handle [sendResponse] wrapper if present
}

export async function addLinkedAccount(accountData: { bankName: string; bankCode: string; accountNumber: string; accountName: string }): Promise<any> {
    const { data } = await API.post("/bank-accounts", accountData);
    return data;
}

export async function getBanks(): Promise<any[]> {
    const { data } = await API.get("/bank-accounts/banks");
    return data.data || data;
}

export async function resolveAccount(accountNumber: string, bankCode: string): Promise<any> {
    const { data } = await API.get('/bank-accounts/resolve', { params: { accountNumber, bankCode }});
    return data.data || data;
}

export async function deleteLinkedAccount(accountId: string): Promise<any> {
    const { data } = await API.delete(`/bank-accounts/${accountId}`);
    return data;
}

export async function requestWithdrawal(withdrawalData: { amount: number; bankName: string; accountNumber: string; accountName: string; pin: string }): Promise<any> {
    const { data } = await API.post("/withdrawal", withdrawalData);
    return data;
}

export async function getMyWithdrawals(): Promise<any[]> {
    const { data } = await API.get("/withdrawal/me");
    return data;
}

export async function initPaystackServer(amount: number, callback_url?: string): Promise<{ authorization_url: string; reference: string }> {
    const { data } = await API.post("/wallet/fund", { amount, provider: 'paystack', callback_url });
    return data;
}

export async function verifyFunding(reference: string): Promise<any> {
    const { data } = await API.get(`/wallet/verify?reference=${reference}`);
    return data;
}
