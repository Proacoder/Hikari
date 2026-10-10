import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_USERS, MOCK_OFFICERS } from '../utils/mockData';

// POST /api/auth/login
export const login = async ({ email, password }) => {
  if (MOCK_MODE) {
    await mockDelay();

    // ── Officer login: match by email + password ─────────────────────────
    const matchedOfficer = MOCK_OFFICERS.find(
      (o) => o.email === email && o.password === password
    );
    if (matchedOfficer) {
      const user = {
        ...matchedOfficer,
        role: 'officer',
        avatarInitials: matchedOfficer.avatarInitials || matchedOfficer.name.split(' ').map(n => n[0]).join(''),
      };
      const token = `mock-jwt-officer-${matchedOfficer.id}-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_officer_id', matchedOfficer.id);
      return successResponse({ user, token });
    }

    // ── Admin login ───────────────────────────────────────────────────────
    if (email.endsWith('@bmc.gov.in') && email.includes('mehta')) {
      const user = MOCK_USERS.admin;
      const token = `mock-jwt-admin-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      return successResponse({ user, token });
    }

    // ── Citizen login (fallback) ──────────────────────────────────────────
    const user = MOCK_USERS.citizen;
    const token = `mock-jwt-citizen-token-${Date.now()}`;
    localStorage.setItem('kaiser_token', token);
    return successResponse({ user, token });
  }

  const res = await apiClient.post('/auth/login', { email, password });
  if (res.data.data?.token) localStorage.setItem('kaiser_token', res.data.data.token);
  return res.data;
};

// POST /api/auth/register
export const register = async (payload) => {
  if (MOCK_MODE) {
    await mockDelay(800);
    const user = { ...MOCK_USERS.citizen, name: payload.name, email: payload.email, phone: payload.phone, ward: payload.ward };
    const token = `mock-jwt-citizen-token-${Date.now()}`;
    localStorage.setItem('kaiser_token', token);
    return successResponse({ user, token });
  }
  const res = await apiClient.post('/auth/register', payload);
  return res.data;
};

// POST /api/auth/google-callback
export const googleLogin = async (credential) => {
  if (MOCK_MODE) {
    await mockDelay(700);
    const token = `mock-jwt-citizen-token-google-${Date.now()}`;
    localStorage.setItem('kaiser_token', token);
    return successResponse({ user: MOCK_USERS.citizen, token });
  }
  const res = await apiClient.post('/auth/google-callback', { credential });
  return res.data;
};

// GET /api/auth/verify
export const verifyToken = async () => {
  if (MOCK_MODE) {
    await mockDelay(400);
    const token = localStorage.getItem('kaiser_token');
    if (!token) throw new Error('No token');

    // Restore officer session
    if (token.includes('officer')) {
      const officerId = localStorage.getItem('kaiser_officer_id');
      const officer = MOCK_OFFICERS.find((o) => o.id === officerId);
      if (officer) {
        const user = { ...officer, role: 'officer', avatarInitials: officer.avatarInitials || officer.name.split(' ').map(n => n[0]).join('') };
        return successResponse({ user });
      }
      return successResponse({ user: { ...MOCK_USERS.officer, role: 'officer' } });
    }
    if (token.includes('admin')) return successResponse({ user: MOCK_USERS.admin });
    return successResponse({ user: MOCK_USERS.citizen });
  }
  const res = await apiClient.get('/auth/verify');
  return res.data;
};

// POST /api/auth/logout
export const logout = async () => {
  localStorage.removeItem('kaiser_token');
  localStorage.removeItem('kaiser_officer_id');
  if (MOCK_MODE) {
    await mockDelay(200);
    return successResponse({ message: 'Logged out' });
  }
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

// POST /api/auth/refresh-token
export const refreshToken = async () => {
  if (MOCK_MODE) {
    await mockDelay(300);
    return successResponse({ token: `mock-jwt-refreshed-${Date.now()}` });
  }
  const res = await apiClient.post('/auth/refresh-token');
  return res.data;
};

// POST /api/auth/forgot-password
export const forgotPassword = async ({ email }) => {
  if (MOCK_MODE) {
    await mockDelay(700);
    return successResponse({ message: 'Reset link sent to ' + email });
  }
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
};

// POST /api/auth/reset-password
export const resetPassword = async ({ token, password }) => {
  if (MOCK_MODE) {
    await mockDelay(600);
    return successResponse({ message: 'Password reset successfully' });
  }
  const res = await apiClient.post('/auth/reset-password', { token, password });
  return res.data;
};
