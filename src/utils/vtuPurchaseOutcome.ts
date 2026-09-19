export type VtuTransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';
export type VtuProviderOutcome = 'success' | 'definitive_failure' | 'pending' | 'unknown';
export type VtuPurchaseOutcome = 'pending' | 'success' | 'failed';

export type VtuPurchaseData = {
    status?: VtuTransactionStatus;
    providerOutcome?: VtuProviderOutcome;
    reference?: string;
    transactionId?: string;
    requestId?: string;
    token?: string;
    purchased_code?: string;
    [key: string]: unknown;
};

export type VtuPurchaseResult = {
    httpStatus: number;
    outcome: VtuPurchaseOutcome;
    success?: boolean;
    message?: string;
    data: VtuPurchaseData;
};

export const VTU_PENDING_MESSAGE = 'Your transaction is awaiting provider confirmation. Please do not make the purchase again. You can check the transaction status using the reference below.';

export function normalizeVtuPurchaseResponse(response: { status: number; data?: { success?: boolean; message?: string; status?: VtuTransactionStatus; data?: VtuPurchaseData } }): VtuPurchaseResult {
    const body = response.data || {};
    const data = body.data || {};
    const status = data.status || body.status;
    const pending = response.status === 202 || status === 'pending';
    const success = !pending && body.success === true && (!status || status === 'success');

    return {
        ...body,
        data,
        httpStatus: response.status,
        outcome: pending ? 'pending' : success ? 'success' : 'failed',
    };
}

export function getVtuPurchasePresentation(result: VtuPurchaseResult, successMessage: string, failureMessage: string) {
    if (result.outcome === 'pending') {
        return {
            status: 'pending' as const,
            message: VTU_PENDING_MESSAGE,
            reference: result.data.reference,
        };
    }

    return {
        status: result.outcome,
        message: result.message || (result.outcome === 'success' ? successMessage : failureMessage),
        reference: result.data.reference || result.data.transactionId || result.data.requestId,
    };
}
