import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_WEATHER } from '../utils/mockData';

// GET /api/weather/:lat/:lng
// Returns live Open-Meteo weather forecast with Asia/Kolkata timezone & AQI
export const getWeatherAQI = async (lat = 19.0760, lng = 72.8777) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_WEATHER);
  }
  try {
    const res = await apiClient.get(`/weather/${lat}/${lng}`);
    return res.data;
  } catch (err) {
    console.warn('Weather telemetry unavailable:', err?.message || err);
    return null;
  }
};

// GET /api/news
// Retrieves verified Mumbai civic infrastructure, public safety, and BMC news via NewsAPI
export const getMumbaiNews = async (query = '', limit = 12) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse([]);
  }
  try {
    const params = { limit };
    if (query) params.q = query;
    const res = await apiClient.get('/news', { params });
    return res.data;
  } catch (err) {
    console.warn('News service unavailable:', err?.message || err);
    return { success: false, articles: [], totalResults: 0, error: err?.message };
  }
};
