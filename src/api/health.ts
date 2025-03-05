import axios from 'axios';
import { TrendData, HealthReport } from '../types';

const BASE_URL = '/api/health';

export const getHeartRateTrend = async (days: number = 7): Promise<TrendData> => {
    const response = await axios.get(`${BASE_URL}/trends/heart-rate`, {
        params: { days }
    });

    return response.data;
};

export const getTemperatureTrend = async (days: number = 7): Promise<TrendData> => {
    const response = await axios.get(`${BASE_URL}/trends/temperature`, {
        params: { days }
    });

    return response.data;
};

export const getHealthReport = async (days: number = 30): Promise<HealthReport> => {
    const response = await axios.get(`${BASE_URL}/report`, {
        params: { days }
    });

    return response.data;
};