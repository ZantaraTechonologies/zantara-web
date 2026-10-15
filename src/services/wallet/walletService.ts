import API from "../api/apiClient";
import type {
    VirtualAccountRequestPayload,
    VirtualAccountRequestResponse,
    VirtualAccountStatusResponse,
} from '../../utils/virtualAccounts';
import { isVirtualAccountRequestResponse, isVirtualAccountStatusResponse } from '../../utils/virtualAccounts';

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
export async function getVirtualAccounts(): Promise<VirtualAccountStatusResponse> {
    const { data } = await API.get("/wallet/virtual-accounts");
    if (!isVirtualAccountStatusResponse(data)) {
        throw new Error('Invalid virtual-account status response');
    }
    return data;
}

export type FundingMethod = {
    code: string;
    name: string;
    supportedChannels: string[];
    isDefault: boolean;
    environment: string;
    virtualAccounts?: {
        supported: boolean;
        type: string | null;
        providerSlugs: string[];
    };
};

export async function getFundingMethods(): Promise<FundingMethod[]> {
    const { data } = await API.get("/wallet/funding-methods");
    return data?.data || [];
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

export async function requestWithdrawal(withdrawalData: { amount: number; accountId: string; pin: string }): Promise<any> {
    const { data } = await API.post("/withdrawal", withdrawalData);
    return data;
}

export async function getMyWithdrawals(): Promise<any[]> {
    const { data } = await API.get("/withdrawal/me");
    return data;
}

export type FundingInitialization = {
    kind: 'checkout' | 'pending';
    httpStatus: number;
    reference: string;
    provider: string;
    checkoutProvider: string;
    authorizationUrl?: string;
    callbackUrl?: string;
    code?: string;
};

export async function initWalletFunding(amount: number): Promise<FundingInitialization> {
    // Amount-only is intentional: the backend selects the configured default
    // gateway and its hosted checkout exposes merchant-enabled methods.
    const response = await API.post("/wallet/fund", { amount });
    const data = response.data || {};
    const reference = typeof data.reference === 'string' ? data.reference.trim() : '';
    const provider = typeof data.provider === 'string' ? data.provider.trim().toLowerCase() : '';
    const checkoutProvider = typeof data.checkoutProvider === 'string'
        ? data.checkoutProvider.trim().toLowerCase()
        : provider;
    if (!reference || !provider) throw new Error('Invalid funding initialization response');

    const authorizationUrl = typeof data.authorization_url === 'string'
        ? data.authorization_url.trim()
        : '';
    if (response.status === 202 || data.status === 'pending' || !authorizationUrl) {
        return {
            kind: 'pending',
            httpStatus: response.status,
            reference,
            provider,
            checkoutProvider,
            code: typeof data.code === 'string' ? data.code : 'PAYMENT_INITIALIZATION_PENDING',
        };
    }
    return {
        kind: 'checkout',
        httpStatus: response.status,
        reference,
        provider,
        checkoutProvider,
        authorizationUrl,
        callbackUrl: typeof data.callbackUrl === 'string' ? data.callbackUrl : undefined,
    };
}

export async function verifyFunding(reference: string): Promise<any> {
    try {
        const { data } = await API.get('/wallet/verify', { params: { reference } });
        return data;
    } catch (error: any) {
        if (error?.response?.status === 404 && error?.response?.data?.status === 'not_found') {
            return { status: 'not_found' };
        }
        throw error;
    }
}

export async function requestVirtualAccounts(
    payload: VirtualAccountRequestPayload = {},
): Promise<VirtualAccountRequestResponse> {
    const { data } = await API.post('/wallet/virtual-accounts/request', payload);
    if (!isVirtualAccountRequestResponse(data)) {
        throw new Error('Invalid virtual-account request response');
    }
    return data;
}
