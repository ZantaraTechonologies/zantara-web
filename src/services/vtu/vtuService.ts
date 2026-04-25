import apiClient from '../api/apiClient';

const VTU_TIMEOUT = 30000; // 30 seconds

const log = (msg: string, data?: any) => {
    if (import.meta.env.DEV) {
        // console.log(`[VTU-SERVICE] ${msg}`, data || ''); // Removed as per instruction
    }
};

export const fetchCatalog = async () => {
    log(`Fetch catalog v2 started`);
    try {
        const res = await apiClient.get(`/v2/catalog`, { timeout: VTU_TIMEOUT });
        log(`Fetch catalog v2 success`);
        return res.data;
    } catch (err) {
        log(`Fetch catalog list failed`, err);
        throw err;
    }
};

export const previewPrice = async (serviceId: string | undefined, amount?: number, serviceCode?: string, quantity?: number) => {
    log(`Preview price started: ${serviceId || serviceCode}`);
    try {
        const res = await apiClient.post(`/v1/pricing/calculate`, { serviceId, amount, serviceCode, quantity }, { timeout: VTU_TIMEOUT });
        log(`Preview price success: ${serviceId || serviceCode}`);
        return res.data;
    } catch (err) {
        log(`Preview price failed: ${serviceId || serviceCode}`, err);
        throw err;
    }
};

export const fetchDataPlans = async (serviceID: string) => {
    log(`Fetch plans started: ${serviceID}`);
    try {
        const res = await apiClient.get(`/services/plans/${serviceID}`, { timeout: VTU_TIMEOUT });
        log(`Fetch plans success: ${serviceID}`);
        return res.data;
    } catch (err) {
        log(`Fetch plans failed: ${serviceID}`, err);
        throw err;
    }
};

export const verifyMeter = async (serviceID: string, billersCode: string, type?: string) => {
    try {
        const res = await apiClient.post('/services/electricity/verify/meter', { serviceID, billersCode, type }, { timeout: VTU_TIMEOUT });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const verifySmartcard = async (serviceID: string, billersCode: string) => {
    try {
        const res = await apiClient.post('/services/cable/verify/smartcard', { serviceID, billersCode }, { timeout: VTU_TIMEOUT });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const verifyJambProfile = async (serviceID: string, billersCode: string) => {
    try {
        const res = await apiClient.post('/services/exam/verify/profile', { serviceID, billersCode }, { timeout: VTU_TIMEOUT });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const verifyMerchant = async (data: { serviceID: string, billersCode: string, type?: string }) => {
    log(`Merchant verification started`, data);
    try {
        const res = await apiClient.post('/services/electricity/verify/meter', data, { timeout: VTU_TIMEOUT });
        log(`Merchant verification success`, res.data);
        return res.data;
    } catch (err) {
        log(`Merchant verification failed`, err);
        throw err;
    }
};


export const buyAirtime = async (data: any) => {
    log('Airtime transaction started', { network: data.network, amount: data.amount });
    try {
        const res = await apiClient.post('/services/airtime', data, { timeout: VTU_TIMEOUT });
        log('Airtime transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Airtime transaction failed', err);
        throw err;
    }
};

export const buyData = async (data: any) => {
    log('Data transaction started', { serviceID: data.serviceID, amount: data.amount });
    try {
        const res = await apiClient.post('/services/data', data, { timeout: VTU_TIMEOUT });
        log('Data transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Data transaction failed', err);
        throw err;
    }
};

export const buyElectricity = async (data: any) => {
    log('Electricity transaction started', { serviceID: data.serviceID, amount: data.amount });
    try {
        const res = await apiClient.post('/services/electricity', data, { timeout: VTU_TIMEOUT });
        log('Electricity transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Electricity transaction failed', err);
        throw err;
    }
};

export const buyCable = async (data: any) => {
    log('Cable transaction started', { serviceID: data.serviceID, variation_code: data.variation_code });
    try {
        const res = await apiClient.post('/services/cable', data, { timeout: VTU_TIMEOUT });
        log('Cable transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Cable transaction failed', err);
        throw err;
    }
};

export const buyExamPin = async (data: any) => {
    log('Exam PIN transaction started', { serviceID: data.serviceID, quantity: data.quantity });
    try {
        const res = await apiClient.post('/services/purchase-pin', data, { timeout: VTU_TIMEOUT });
        log('Exam PIN transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Exam PIN transaction failed', err);
        throw err;
    }
};
