import { apiClient, MOCK_MODE, mockDelay, successResponse, errorResponse } from './client';
import { MOCK_USERS, MOCK_OFFICERS, DEMO_CITIZENS } from '../utils/mockData';

// ── Input sanitization (strip HTML/script tags to prevent stored XSS) ────────
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"&]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;',
  }[c] || c));
};

// ── Brute-force rate-limiter (per email, frontend-only) ─────────────────────
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minute

function checkRateLimit(email) {
  const key = email.toLowerCase().trim();
  const record = loginAttempts.get(key);
  if (!record) return true;
  if (Date.now() - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(key);
    return true;
  }
  return record.count < MAX_ATTEMPTS;
}

function recordAttempt(email) {
  const key = email.toLowerCase().trim();
  const record = loginAttempts.get(key);
  if (!record || Date.now() - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: Date.now() });
  } else {
    record.count += 1;
  }
}

function clearAttempts(email) {
  loginAttempts.delete(email.toLowerCase().trim());
}

// ── Session User Storage Helper ──────────────────────────────────────────────
export const getCurrentSessionUser = () => {
  try {
    const raw = localStorage.getItem('kaiser_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return null;
};

// POST /api/auth/login
export const login = async ({ email, password }) => {
  if (MOCK_MODE) {
    await mockDelay();

    // Sanitize inputs
    const cleanEmail = sanitize(email).trim().toLowerCase();
    const cleanPassword = password; // passwords are compared, not rendered

    // Basic validation
    if (!cleanEmail || !cleanPassword) {
      throw new Error('Email and password are required.');
    }

    // Rate-limit check
    if (!checkRateLimit(cleanEmail)) {
      throw new Error('Too many login attempts. Please wait 1 minute before trying again.');
    }

    // ── Officer login: match by email + password ─────────────────────────
    const matchedOfficer = MOCK_OFFICERS.find(
      (o) => o.email.toLowerCase() === cleanEmail && o.password === cleanPassword
    );
    if (matchedOfficer) {
      clearAttempts(cleanEmail);
      const user = {
        ...matchedOfficer,
        role: 'officer',
        avatarInitials: matchedOfficer.avatarInitials || matchedOfficer.name.split(' ').map(n => n[0]).join(''),
      };
      const token = `mock-jwt-officer-${matchedOfficer.id}-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_officer_id', matchedOfficer.id);
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── Admin login ───────────────────────────────────────────────────────
    if (cleanEmail === MOCK_USERS.admin.email.toLowerCase() && cleanPassword === MOCK_USERS.admin.password) {
      clearAttempts(cleanEmail);
      const user = MOCK_USERS.admin;
      const token = `mock-jwt-admin-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── Citizen login: match by email + password (both demo accounts) ────
    const allCitizens = DEMO_CITIZENS;
    const matchedCitizen = allCitizens.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.password === cleanPassword
    );
    if (matchedCitizen) {
      clearAttempts(cleanEmail);
      const user = { ...matchedCitizen };
      delete user.password; // Never send password in response
      const token = `mock-jwt-citizen-${matchedCitizen.id}-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_citizen_id', matchedCitizen.id);
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── No match: invalid credentials ────────────────────────────────────
    recordAttempt(cleanEmail);
    throw new Error('Invalid email or password. Please check your credentials and try again.');
  }

  const res = await apiClient.post('/auth/login', { email, password });
  if (res.data.data?.token) localStorage.setItem('kaiser_token', res.data.data.token);
  return res.data;
};

// POST /api/auth/register
export const register = async (payload) => {
  if (MOCK_MODE) {
    await mockDelay(800);

    // Validate required fields
    const cleanName = sanitize(payload.name).trim();
    const cleanEmail = sanitize(payload.email).trim().toLowerCase();
    const cleanPhone = sanitize(payload.phone || '').trim();
    const cleanPassword = payload.password;

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if email already registered
    const allCitizens = DEMO_CITIZENS;
    if (allCitizens.find(c => c.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const user = {
      ...MOCK_USERS.citizen,
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      ward: payload.ward || MOCK_USERS.citizen.ward,
      avatarInitials: cleanName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    const token = `mock-jwt-citizen-${user.id}-token-${Date.now()}`;
    localStorage.setItem('kaiser_token', token);
    localStorage.setItem('kaiser_citizen_id', user.id);
    localStorage.setItem('kaiser_user', JSON.stringify(user));
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
    localStorage.setItem('kaiser_user', JSON.stringify(MOCK_USERS.citizen));
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
        localStorage.setItem('kaiser_user', JSON.stringify(user));
        return successResponse({ user });
      }
      const user = { ...MOCK_USERS.officer, role: 'officer' };
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user });
    }
    if (token.includes('admin')) {
      localStorage.setItem('kaiser_user', JSON.stringify(MOCK_USERS.admin));
      return successResponse({ user: MOCK_USERS.admin });
    }

    // Restore citizen session — match specific citizen
    if (token.includes('citizen')) {
      const citizenId = localStorage.getItem('kaiser_citizen_id');
      const citizen = DEMO_CITIZENS.find(c => c.id === citizenId);
      if (citizen) {
        const user = { ...citizen };
        delete user.password;
        localStorage.setItem('kaiser_user', JSON.stringify(user));
        return successResponse({ user });
      }
      const savedUser = getCurrentSessionUser();
      if (savedUser) return successResponse({ user: savedUser });
      localStorage.setItem('kaiser_user', JSON.stringify(MOCK_USERS.citizen));
      return successResponse({ user: MOCK_USERS.citizen });
    }

    return successResponse({ user: MOCK_USERS.citizen });
  }
  const res = await apiClient.get('/auth/verify');
  return res.data;
};

// POST /api/auth/logout
export const logout = async () => {
  localStorage.removeItem('kaiser_token');
  localStorage.removeItem('kaiser_officer_id');
  localStorage.removeItem('kaiser_citizen_id');
  localStorage.removeItem('kaiser_user');
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
    return successResponse({ message: 'Reset link sent to ' + sanitize(email) });
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
