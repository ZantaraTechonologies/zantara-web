import api from '../api/apiClient';

export interface PaymentInitializationResponse {
    authorization_url: string;
    reference: string;
    // For direct transfers, backend might include account details
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    amount?: number;
}

export const paymentService = {
  /**
   * Initializes a Paystack transaction with specific metadata
   * @param amount Amount in Naira
   * @param type 'funding' or 'investment_buy'
   * @param metadata Additional payload (e.g., qty for shares)
   * @param isDirectTransfer If true, requests direct account details for transfer channel
   */
  initializePayment: async (amount: number, type: 'funding' | 'investment_buy', metadata: any = {}, isDirectTransfer: boolean = false) => {
    const response = await api.post('/paystack/initialize', {
        amount,
        channels: isDirectTransfer ? ['bank_transfer'] : ['card', 'bank_transfer', 'ussd'],
        metadata: {
            ...metadata,
            type,
            callback_url: `${window.location.origin}/paystack/return`
        },
        isDirectTransfer
    });
    return response.data as PaymentInitializationResponse;
  },

  /**
   * Polls the backend for the current status of a transaction reference
   */
  checkTransactionStatus: async (reference: string) => {
    const response = await api.get(`/paystack/verify?reference=${reference}`);
    return response.data;
  }
};
