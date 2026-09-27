import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_WEATHER } from '../utils/mockData';

// GET /api/weather/:lat/:lng
export const getWeatherAQI = async (lat, lng) => {
  if (MOCK_MODE) {
    await mockDelay(400);
    return successResponse(MOCK_WEATHER);
  }
  const res = await apiClient.get(`/weather/${lat}/${lng}`);
  return res.data;
};
