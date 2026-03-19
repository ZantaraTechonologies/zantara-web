import apiClient from '../api/apiClient';

const VTU_TIMEOUT = 30000; // 30 seconds

const log = (msg: string, data?: any) => {
    if (import.meta.env.DEV) {
        console.log(`[VTU-SERVICE] ${msg}`, data || '');
    }
};

export const fetchDataPlans = async (serviceID: string) => {
    log(`Fetch plans started: ${serviceID}`);
    try {
        const res = await apiClient.get(`/vtu/variations/${serviceID}`, { timeout: VTU_TIMEOUT });
        log(`Fetch plans success: ${serviceID}`);
        return res.data;
    } catch (err) {
        log(`Fetch plans failed: ${serviceID}`, err);
        throw err;
    }
};

export const verifyMeter = async (serviceID: string, billersCode: string) => {
    log(`Meter verification started: ${serviceID} | ${billersCode}`);
    try {
        const res = await apiClient.post('/vtu/verify', { serviceID, billersCode }, { timeout: VTU_TIMEOUT });
        log(`Meter verification success: ${serviceID}`);
        return res.data;
    } catch (err) {
        log(`Meter verification failed: ${serviceID}`, err);
        throw err;
    }
};

export const verifySmartcard = async (serviceID: string, billersCode: string) => {
    log(`Smartcard verification started: ${serviceID} | ${billersCode}`);
    try {
        const res = await apiClient.post('/vtu/verify', { serviceID, billersCode }, { timeout: VTU_TIMEOUT });
        log(`Smartcard verification success: ${serviceID}`);
        return res.data;
    } catch (err) {
        log(`Smartcard verification failed: ${serviceID}`, err);
        throw err;
    }
};

export const buyAirtime = async (data: any) => {
    log('Airtime transaction started', { network: data.network, amount: data.amount });
    try {
        const res = await apiClient.post('/vtu/airtime', data, { timeout: VTU_TIMEOUT });
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
        const res = await apiClient.post('/vtu/data', data, { timeout: VTU_TIMEOUT });
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
        const res = await apiClient.post('/vtu/electricity', data, { timeout: VTU_TIMEOUT });
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
        const res = await apiClient.post('/vtu/cable', data, { timeout: VTU_TIMEOUT });
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
        const res = await apiClient.post('/vtu/exam', data, { timeout: VTU_TIMEOUT });
        log('Exam PIN transaction success', res.data);
        return res.data;
    } catch (err) {
        log('Exam PIN transaction failed', err);
        throw err;
    }
};
