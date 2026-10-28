import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_WEATHER } from '../utils/mockData';

// GET /api/weather/:lat/:lng
// Returns null on any failure so callers can handle it gracefully without crashing.
export const getWeatherAQI = async (lat, lng) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_WEATHER);
  }
  try {
    const res = await apiClient.get(`/weather/${lat}/${lng}`);
    return res.data;
  } catch {
    // Weather is non-critical — return null so the UI can show a fallback
    return null;
  }
};
