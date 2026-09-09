import apiClient from "../api/apiClient";

export interface PaymentGatewayItem {
    _id: string;
    name: string;
    code: string;
    adapterType: 'paystack' | 'monnify' | 'flutterwave';
    status: 'active' | 'inactive' | 'maintenance';
    environment: 'test' | 'live';
    isDefault: boolean;
    priority: number;
    publicKey?: string;
    baseUrl?: string;
    supportedChannels: ('card' | 'bank_transfer' | 'ussd' | 'virtual_account')[];
    metadata?: Record<string, any>;
    lastHealthCheck?: {
        status: 'online' | 'offline' | 'unknown';
        checkedAt?: string;
        message?: string;
    };
    secretKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReconciliationTransaction {
    _id: string;
    reference: string;
    gateway: string;
    status: 'processing' | 'reconciliation_required';
    user?: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    expectedAmount: number;
    confirmedAmount: number | null;
    expectedCurrency: string;
    confirmedCurrency: string | null;
    confirmedProviderRef: string | null;
    reconciliationReason: string | null;
    elapsedMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export interface CredentialField {
    key: 'publicKey' | 'secretKey' | 'webhookSecret';
    label: string;
    type: 'text' | 'password';
    sensitive: boolean;
    required: boolean;
    placeholder: string;
}

export interface MetadataField {
    key: string;
    label: string;
    type: 'text' | 'password';
    sensitive: boolean;
    required: boolean;
    placeholder: string;
}

export interface AdapterCapability {
    code: string;
    label: string;
    defaultBaseUrl: string;
    supportedChannels: string[];
    credentialFields: CredentialField[];
    metadataFields: MetadataField[];
}

const BASE_URL = "/admin/payment-gateways";

export const getPaymentGateways = async () => {
    const response = await apiClient.get(BASE_URL);
    return response.data;
};

export const getPaymentGateway = async (id: string) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Returns adapter capability registry from the backend.
 * Safe metadata only — no credentials exposed.
 */
export const getAdapterCapabilities = async (): Promise<{ success: boolean; data: AdapterCapability[] }> => {
    const response = await apiClient.get(`${BASE_URL}/capabilities`);
    return response.data;
};

export const createPaymentGateway = async (data: Partial<PaymentGatewayItem> & { secretKey?: string; webhookSecret?: string }) => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
};

export const updatePaymentGateway = async (id: string, data: Partial<PaymentGatewayItem> & { secretKey?: string; webhookSecret?: string }) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
};

export const updateGatewayStatus = async (id: string, status: 'active' | 'inactive' | 'maintenance') => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { status });
    return response.data;
};

export const setDefaultGateway = async (id: string) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/set-default`);
    return response.data;
};

export const testGatewayConnection = async (id: string) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/test-connection`);
    return response.data;
};

export const getReconciliationTransactions = async () => {
    const response = await apiClient.get(`${BASE_URL}/reconciliation`);
    return response.data;
};

