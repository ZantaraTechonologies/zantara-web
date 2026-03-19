import apiClient from '../api/apiClient';

const USER_TIMEOUT = 30000;

export const updateProfile = async (data: any) => {
    const res = await apiClient.put('/auth/update-profile', data, { timeout: USER_TIMEOUT });
    return res.data;
};

export const changePassword = async (data: any) => {
    const res = await apiClient.post('/auth/change-password', data, { timeout: USER_TIMEOUT });
    return res.data;
};

export const setupPin = async (data: { pin: string }) => {
    const res = await apiClient.post('/auth/set-pin', data, { timeout: USER_TIMEOUT });
    return res.data;
};

export const updatePin = async (data: { oldPin: string, newPin: string }) => {
    const res = await apiClient.post('/auth/update-pin', data, { timeout: USER_TIMEOUT });
    return res.data;
};

export const uploadKYC = async (formData: FormData) => {
    const res = await apiClient.post('/auth/upload-kyc', formData, {
        timeout: 60000, // Longer timeout for uploads
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const getKYCStatus = async () => {
    const res = await apiClient.get('/auth/kyc-status', { timeout: USER_TIMEOUT });
    return res.data;
};

export const getKYCLevels = async () => {
    const res = await apiClient.get('/auth/kyc-levels', { timeout: USER_TIMEOUT });
    return res.data;
};
