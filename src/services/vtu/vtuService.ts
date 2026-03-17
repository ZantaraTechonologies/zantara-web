import API from '../api/apiClient';

export const buyData = async (payload: any) => {
    const res = await API.post('/services/data', payload);
    return res.data;
};

export const buyAirtime = async (payload: any) => {
    const res = await API.post('/services/airtime', payload);
    return res.data;
};

export const buyCable = async (payload: any) => {
    const res = await API.post('/services/cable', payload);
    return res.data;
};

export const buyExamPin = async (payload: any) => {
    const res = await API.post('/services/purchase-pin', payload);
    return res.data;
};

export const buyElectricity = async (payload: any) => {
    const res = await API.post('/services/electricity', payload);
    return res.data;
};
