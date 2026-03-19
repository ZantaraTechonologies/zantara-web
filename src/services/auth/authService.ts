import API from '../api/apiClient';

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
}

export interface AuthResponse {
    ok: boolean;
    user?: User;
    token?: string;
    message?: string;
}

export const login = async (credentials: any): Promise<AuthResponse> => {
    const res = await API.post('/auth/login', credentials);
    return res.data;
};

export const register = async (userData: any): Promise<AuthResponse> => {
    const res = await API.post('/auth/register', userData);
    return res.data;
};

export const logout = async (): Promise<void> => {
    await API.post('/auth/logout');
};

export const getMe = async (): Promise<AuthResponse> => {
    const res = await API.get('/auth/me');
    return res.data;
};
