import API from '../api/apiClient';
import type { OnboardingState } from '../../utils/onboarding';

export interface LegalDocumentRequirement {
    documentType: string;
    title: string;
    version: number;
    contentHash: string;
    contentHtml: string;
    acceptanceMode: 'agreement' | 'acknowledgement' | 'none';
    acceptanceRequired: boolean;
    pendingReacceptance: boolean;
}

export interface LegalRequirements {
    documents: LegalDocumentRequirement[];
    pendingReacceptance: boolean;
    missingAcceptances: string[];
    missingMandatoryDocuments: string[];
}

export const getOnboardingStatus = async (): Promise<OnboardingState> => {
    const response = await API.get('/onboarding/status');
    return response.data.onboarding;
};

export const sendPhoneVerificationCode = async () => {
    const response = await API.post('/auth/send-otp', { purpose: 'phone_verification' });
    return response.data;
};

export const verifyPhoneCode = async (otp: string) => {
    const response = await API.post('/auth/verify-otp', { otp });
    return response.data;
};

export const sendEmailVerificationCode = async () => {
    const response = await API.post('/auth/email/send-otp');
    return response.data;
};

export const verifyEmailCode = async (otp: string) => {
    const response = await API.post('/auth/email/verify-otp', { otp });
    return response.data;
};

export const getLegalRequirements = async (): Promise<LegalRequirements> => {
    const response = await API.get('/legal/requirements');
    return response.data.data;
};

export const acceptLegalDocument = async (document: LegalDocumentRequirement) => {
    const response = await API.post('/legal/acceptance', {
        documentType: document.documentType,
        version: document.version,
        contentHash: document.contentHash,
        channel: 'web',
    });
    return response.data;
};
