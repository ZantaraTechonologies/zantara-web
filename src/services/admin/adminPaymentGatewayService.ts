import apiClient from "../api/apiClient";

/**
 * Adapter engine types are derived from the backend adapter registry
 * (adapters/payment/paymentAdapterRegistry.js) exposed via
 * GET /admin/payment-gateways/capabilities.
 *
 * A bare string type is intentional: new gateway adapters can be added to the
 * registry without a frontend code change. The Admin UI must never hardcode
 * a closed union of gateway names.
 */
export type AdapterType = string;

export type MonnifyEnvironment = 'test' | 'live';

export interface MonnifyCheckoutValidation {
    status: 'initializing' | 'initialized' | 'ambiguous' | 'verified';
    reference?: string;
    gatewayId?: string;
    environment?: MonnifyEnvironment;
    configurationVersion?: number;
    amountKobo?: number;
    currency?: string;
    initializedAt?: string;
    verifiedAt?: string;
    expiresAt?: string;
}

export interface MonnifyCustomerFundingEligibility {
    status: 'eligible';
    reference?: string;
    gatewayId?: string;
    environment?: MonnifyEnvironment;
    configurationVersion?: number;
    verifiedAt?: string;
}

export interface PaymentGatewayMetadata {
    contractCode?: string;
    administrativeSandboxOnly?: boolean;
    checkoutValidation?: MonnifyCheckoutValidation;
    customerFundingEligibility?: MonnifyCustomerFundingEligibility;
    [key: string]: unknown;
}

export interface PaymentGatewayItem {
    _id: string;
    name: string;
    code: string;
    adapterType: AdapterType;
    status: 'active' | 'inactive' | 'maintenance';
    environment: 'test' | 'live';
    isDefault: boolean;
    priority: number;
    publicKey?: string;
    baseUrl?: string;
    supportedChannels: ('card' | 'bank_transfer' | 'ussd' | 'virtual_account')[];
    metadata?: PaymentGatewayMetadata;
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

export type MonnifyMerchantReplacement = {
    publicKey: string;
    secretKey: string;
    webhookSecret?: string;
    contractCode: string;
    environment: MonnifyEnvironment;
    baseUrl?: string;
    currentPassword: string;
    confirmation: 'replace-monnify-merchant' | 'replace-monnify-live-merchant';
};

export const replaceMonnifyMerchant = async (id: string, data: MonnifyMerchantReplacement) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/replace-monnify-merchant`, data);
    return response.data;
};

export type MonnifyCheckoutRequest = {
    amount: number;
    currentPassword: string;
    confirmation?: 'initialize-monnify-live-validation-checkout';
};

export const testMonnifyHostedCheckout = async (id: string, data: MonnifyCheckoutRequest) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/test-monnify-checkout`, data);
    return { ...response.data, httpStatus: response.status };
};

export type MonnifyCustomerFundingRequest = {
    reference: string;
    currentPassword: string;
    confirmation: 'enable-monnify-test-customer-funding' | 'enable-monnify-live-customer-funding';
};

export const enableMonnifyCustomerFunding = async (id: string, data: MonnifyCustomerFundingRequest) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/enable-monnify-customer-funding`, data);
    return { ...response.data, httpStatus: response.status };
};

export const getReconciliationTransactions = async () => {
    const response = await apiClient.get(`${BASE_URL}/reconciliation`);
    return response.data;
};
