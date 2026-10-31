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

export const CURATED_CIVIC_BULLETINS = [
  {
    title: 'BMC Pre-Monsoon Drainage & Desilting Operations Reach 84% Completion Across 24 Wards',
    source: 'BMC Municipal Press Wire',
    publishedAt: '2026-10-28T09:30:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/storm-drain.jpg',
    description: 'Brihanmumbai Municipal Corporation completes major nullah desilting audits ahead of seasonal rains with GPS-tracked silt hauling.',
  },
  {
    title: 'Mumbai Coastal Road Project Commences Night Surveillance & Air Quality Telemetry',
    source: 'Mumbai Civic Gazette',
    publishedAt: '2026-10-27T14:15:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/sealink-bridge.jpg',
    description: 'Advanced atmospheric sensors and AI incident detection cameras deployed along the promenade for pedestrian and traffic safety.',
  },
  {
    title: 'Pothole Grievance Redressal Acceleration: 48-Hour Rapid SLA Implemented in Mumbai Suburbs',
    source: 'Maharashtra Urban Infrastructure',
    publishedAt: '2026-10-26T11:00:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/road-asphalt.jpg',
    description: 'Ward engineering squads adopt cold-mix quick mastic asphalt technology to accelerate grievance closures for reported road defects.',
  },
  {
    title: 'BMC Water Supply Pipeline Modernization: New 1800mm Tansa Main Connection in Western Suburbs',
    source: 'BMC Hydraulic Engineering Dept',
    publishedAt: '2026-10-25T08:00:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/water-pipeline.jpg',
    description: 'Upgrades to the primary municipal water distribution pipelines ensure steady potable water pressure across Bandra, Andheri, and Borivali.',
  },
  {
    title: 'Clean Mumbai Campaign: BMC Deploys 120 Automated Mechanical Sweepers Across Island City',
    source: 'BMC Solid Waste Management',
    publishedAt: '2026-10-24T12:30:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/street-sweeper.jpg',
    description: 'New electric waste compactors and automated street scrubbers initiate nighttime cleaning corridors across Marine Drive, Colaba, and Dadar.',
  },
  {
    title: 'IMD Doppler Radar Telemetry: Automated Sump Dewatering Stations Operational Along Mithi River',
    source: 'BMC Disaster Management',
    publishedAt: '2026-10-23T15:45:00Z',
    url: 'https://www.mcgm.gov.in',
    imageUrl: '/civic/news/powai-lake.jpg',
    description: '64 high-capacity submersible dewatering pumps placed on active standby with real-time water depth sensors connected to 1916 Control Room.',
  },
];

// GET /api/news
// Retrieves verified Mumbai civic infrastructure, public safety, and BMC news via live RSS and NewsAPI
export const getMumbaiNews = async (query = '', limit = 12) => {
  try {
    const params = { limit };
    if (query) params.q = query;
    const res = await apiClient.get('/news', { params });
    if (res.data?.articles && res.data.articles.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('News service error (using fallback bulletins):', err?.message || err);
  }

  return {
    success: true,
    articles: CURATED_CIVIC_BULLETINS,
    totalResults: CURATED_CIVIC_BULLETINS.length,
    provider: 'Civic News Wire (Curated BMC Advisories)',
    isLiveData: false,
  };
};
