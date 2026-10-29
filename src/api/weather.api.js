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

// GET /api/air-quality/:lat/:lng
// Retrieves Open-Meteo Air Quality telemetry (US AQI, European AQI, PM2.5, PM10, NO2, O3)
export const getAirQuality = async (lat = 19.0760, lng = 72.8777) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse({
      usAqi: 112,
      usAqiStandard: 'US Air Quality Index (EPA Standard)',
      europeanAqi: 48,
      europeanAqiStandard: 'European Air Quality Index (EAQI)',
      pm25: 41.5,
      pm10: 78.0,
      nitrogenDioxide: 22.0,
      ozone: 85.0,
      isGroundStation: false,
      groundStationNotice: 'Modeled atmospheric forecast data from Open-Meteo/CAMS; not a certified physical ground-monitoring station.',
    });
  }
  try {
    const res = await apiClient.get(`/air-quality/${lat}/${lng}`);
    return res.data;
  } catch (err) {
    console.warn('Air quality telemetry unavailable:', err?.message || err);
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
