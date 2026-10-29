import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_USERS, MOCK_OFFICERS, DEMO_CITIZENS } from '../utils/mockData';

// ── Input normalizer ─────────────────────────────────────────────────────────
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

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
    console.warn('[SECURITY NOTICE] Running in development mock mode (VITE_MOCK_MODE=true). No passwords stored or validated in bundle.');
    await mockDelay();

    // Standardize inputs
    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Basic validation
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    // ── Officer login: match by email in mock mode ─────────────────────────
    const matchedOfficer = MOCK_OFFICERS.find(
      (o) => o.email.toLowerCase() === cleanEmail
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
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── Admin login ───────────────────────────────────────────────────────
    if (cleanEmail === MOCK_USERS.admin.email.toLowerCase()) {
      const user = { ...MOCK_USERS.admin };
      const token = `mock-jwt-admin-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── Citizen login: match by email (both demo accounts) ────
    const allCitizens = DEMO_CITIZENS;
    const matchedCitizen = allCitizens.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    if (matchedCitizen) {
      const user = { ...matchedCitizen };
      const token = `mock-jwt-citizen-${matchedCitizen.id}-token-${Date.now()}`;
      localStorage.setItem('kaiser_token', token);
      localStorage.setItem('kaiser_citizen_id', matchedCitizen.id);
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      return successResponse({ user, token });
    }

    // ── No match: invalid credentials ────────────────────────────────────
    throw new Error('Invalid email or user not found in mock database.');
  }

  const res = await apiClient.post('/auth/login', { email, password });
  if (res.data.data?.token) {
    localStorage.setItem('kaiser_token', res.data.data.token);
    const user = res.data.data?.user;
    if (user) {
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      if (user.role === 'officer' && user.id) {
        localStorage.setItem('kaiser_officer_id', user.id);
      } else if (user.role === 'citizen' && user.id) {
        localStorage.setItem('kaiser_citizen_id', user.id);
      }
    }
  }
  return res.data;
};

// POST /api/auth/register
export const register = async (payload) => {
  if (MOCK_MODE) {
    await mockDelay();

    // Validate required fields
    const cleanName = sanitizeInput(payload.name).trim();
    const cleanEmail = sanitizeInput(payload.email).trim().toLowerCase();
    const cleanPhone = sanitizeInput(payload.phone || '').trim();
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
  if (res.data.data?.token) {
    localStorage.setItem('kaiser_token', res.data.data.token);
    const user = res.data.data?.user;
    if (user) {
      localStorage.setItem('kaiser_user', JSON.stringify(user));
      if (user.role === 'citizen' && user.id) {
        localStorage.setItem('kaiser_citizen_id', user.id);
      }
    }
  }
  return res.data;
};

// POST /api/auth/forgot-password
export const requestPasswordReset = async (email) => {
  if (MOCK_MODE) {
    await mockDelay();
    const cleanEmail = sanitizeInput(email).toLowerCase();
    return successResponse({
      message: `Password recovery code dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      dev_otp: '123456',
    });
  }
  const res = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
};

// POST /api/auth/reset-password
export const resetPassword = async ({ email, otp, newPassword }) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  }
  const res = await apiClient.post('/auth/reset-password', {
    email,
    otp,
    new_password: newPassword,
  });
  return res.data;
};


// GET /api/auth/verify
export const verifyToken = async () => {
  if (MOCK_MODE) {
    await mockDelay();
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
      const user = { ...MOCK_OFFICERS[0], role: 'officer' };
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

  const token = localStorage.getItem('kaiser_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await apiClient.get('/auth/verify');
  const user = res.data.data?.user;
  if (user) {
    localStorage.setItem('kaiser_user', JSON.stringify(user));
    if (user.role === 'officer' && user.id) {
      localStorage.setItem('kaiser_officer_id', user.id);
    } else if (user.role === 'citizen' && user.id) {
      localStorage.setItem('kaiser_citizen_id', user.id);
    }
  }
  return res.data;
};

// POST /api/auth/logout
export const logout = async () => {
  localStorage.removeItem('kaiser_token');
  localStorage.removeItem('kaiser_officer_id');
  localStorage.removeItem('kaiser_citizen_id');
  localStorage.removeItem('kaiser_user');
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse({ message: 'Logged out' });
  }
  const res = await apiClient.post('/auth/logout');
  return res.data;
};
