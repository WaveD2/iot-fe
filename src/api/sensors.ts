import axios from 'axios';
import { SensorData } from '../types';

const BASE_URL = '/api/sensors';

export const recordSensorData = async (heartRate: number, temperature: number): Promise<SensorData> => {
    const response = await axios.post(`${BASE_URL}/record`, {
        heartRate,
        temperature
    });

    return response.data;
};

export const getSensorData = async (limit: number = 100): Promise<SensorData[]> => {
    const response = await axios.get(`${BASE_URL}/data`, {
        params: { limit }
    });

    return response.data;
};

export const getSensorDataByTimeRange = async (startTime: Date, endTime: Date): Promise<SensorData[]> => {
    const response = await axios.get(`${BASE_URL}/data/range`, {
        params: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        }
    });

    return response.data;
};

export const getLatestSensorData = async (): Promise<SensorData> => {
    const response = await axios.get(`${BASE_URL}/data/latest`);
    return response.data;
};

export const getAverageSensorData = async (startTime: Date, endTime: Date): Promise<{
    averageHeartRate: number;
    averageTemperature: number;
}> => {
    const response = await axios.get(`${BASE_URL}/data/average`, {
        params: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        }
    });

    return response.data;
};