import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_WEATHER } from '../utils/mockData';

// GET /api/weather/:lat/:lng
export const getWeatherAQI = async (lat, lng) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_WEATHER);
  }
  try {
    const res = await apiClient.get(`/weather/${lat}/${lng}`);
    return res.data;
  } catch (err) {
    console.warn('Weather service unavailable, using local meteorological data fallback:', err.message);
    return successResponse(MOCK_WEATHER);
  }
};
