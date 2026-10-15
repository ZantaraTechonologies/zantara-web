import API from '../api/apiClient';
import type { OnboardingState } from '../../utils/onboarding';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: string[];
    totalReferralBonus?: number;
    myReferralCode?: string;
    hasPIN?: boolean;
    kycStatus?: 'none' | 'pending' | 'verified' | 'rejected';
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    isPinSet?: boolean;
}

export interface AuthResponse {
    ok: boolean;
    user?: User;
    token?: string;
    message?: string;
    onboarding?: OnboardingState;
}

export const login = async (credentials: any): Promise<AuthResponse> => {
    const res = await API.post('/auth/login', credentials);
    return res.data;
};

export const register = async (userData: any): Promise<AuthResponse> => {
    const res = await API.post('/auth/register', userData);
    return res.data;
};

export const logout = async (token?: string | null): Promise<void> => {
    await API.post('/auth/logout', undefined, token ? {
        headers: { Authorization: `Bearer ${token}` }
    } : undefined);
};

export const getMe = async (): Promise<AuthResponse> => {
    const res = await API.get('/auth/me');
    return res.data;
};

export const getOnboardingStatus = async (): Promise<OnboardingState> => {
    const res = await API.get('/onboarding/status');
    return res.data.onboarding;
};
