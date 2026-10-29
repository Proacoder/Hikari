import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_ANALYTICS } from '../utils/mockData';

// GET /api/analytics/summary (Public non-sensitive aggregate statistics)
export const getPublicSummary = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse({
      totalComplaints: MOCK_ANALYTICS.dashboard.totalComplaints,
      resolvedComplaints: MOCK_ANALYTICS.dashboard.resolvedComplaints,
      resolvedRate: MOCK_ANALYTICS.dashboard.resolutionRate,
      resolutionRate: MOCK_ANALYTICS.dashboard.resolutionRate,
      avgResolutionDays: MOCK_ANALYTICS.dashboard.avgResolutionDays || 0.77,
    });
  }
  const res = await apiClient.get('/analytics/summary');
  return res.data;
};

// GET /api/analytics/dashboard (Protected for officer and admin)
export const getDashboardStats = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_ANALYTICS.dashboard);
  }
  const res = await apiClient.get('/analytics/dashboard');
  return res.data;
};

// GET /api/analytics/by-category
export const getCategoryAnalytics = async ({ startDate, endDate } = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_ANALYTICS.byCategory);
  }
  const res = await apiClient.get('/analytics/by-category', { params: { startDate, endDate } });
  return res.data;
};

// GET /api/analytics/by-ward
export const getWardAnalytics = async ({ startDate, endDate } = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_ANALYTICS.byWard);
  }
  const res = await apiClient.get('/analytics/by-ward', { params: { startDate, endDate } });
  return res.data;
};

// GET /api/analytics/trends
export const getResolutionTrends = async ({ months = 6 } = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse({
      trends: MOCK_ANALYTICS.trends,
      weatherCorrelation: MOCK_ANALYTICS.weatherCorrelation,
    });
  }
  const res = await apiClient.get('/analytics/trends', { params: { months } });
  return res.data;
};
