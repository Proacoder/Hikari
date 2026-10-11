import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_COMPLAINTS, MOCK_COMMENTS } from '../utils/mockData';
import { getCurrentSessionUser } from './auth.api';

const STORAGE_KEY = 'kaiser_complaints_store';

export const getStoredComplaints = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return MOCK_COMPLAINTS;
};

export const saveStoredComplaints = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }
};

// GET /api/complaints
export const getComplaints = async ({ ward, category, status, page = 1, limit = 50 } = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
    let data = [...getStoredComplaints()];
    if (ward)     data = data.filter((c) => Number(c.ward) === Number(ward));
    if (category) data = data.filter((c) => c.category === category);
    if (status)   data = data.filter((c) => c.status === status);
    const total = data.length;
    const start = (page - 1) * limit;
    return successResponse(data.slice(start, start + limit), { page, limit, total });
  }
  const res = await apiClient.get('/complaints', { params: { ward, category, status, page, limit } });
  return res.data;
};

// GET /api/complaints/:id
export const getComplaintById = async (id) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const found = complaints.find((c) => c.id === id);
    if (!found) throw { response: { data: { success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } } } };
    return successResponse(found);
  }
  const res = await apiClient.get(`/complaints/${id}`);
  return res.data;
};

// POST /api/complaints (multipart or json)
export const createComplaint = async (formData) => {
  if (MOCK_MODE) {
    await mockDelay(600);
    const uploadedImage = formData.get
      ? formData.get('imageUrl') || formData.get('image')
      : (formData.imageUrl || formData.image);
    const defaultImg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';

    const lat = Number(formData.get ? (formData.get('latitude') || formData.get('lat')) : (formData.latitude || formData.lat)) || 19.076;
    const lng = Number(formData.get ? (formData.get('longitude') || formData.get('lng')) : (formData.longitude || formData.lng)) || 72.877;
    const wardId = Number(formData.get ? formData.get('ward') : formData.ward) || 1;
    const landmark = formData.get ? formData.get('landmark') : (formData.landmark || '');

    const newComplaint = {
      id: `cmp-${Date.now()}`,
      title: formData.get ? formData.get('title') : formData.title,
      description: formData.get ? formData.get('description') : formData.description,
      category: formData.get ? formData.get('category') : formData.category,
      severity: Number(formData.severity) || Math.floor(Math.random() * 30) + 55,
      latitude: lat,
      longitude: lng,
      ward: wardId,
      landmark: landmark,
      imageUrl: uploadedImage || formData.imageUrl || defaultImg,
      status: 'reported',
      createdBy: (() => {
        const sessionUser = getCurrentSessionUser();
        if (formData.createdBy) return formData.createdBy;
        if (sessionUser) {
          return {
            id: sessionUser.id,
            name: sessionUser.name,
            email: sessionUser.email,
            ward: sessionUser.ward || wardId,
          };
        }
        return { id: 'anonymous', name: 'Citizen' };
      })(),
      assignedOfficer: null,
      upvoteCount: 1,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      aiAnalysis: {
        categoryDetected: formData.get ? formData.get('category') : formData.category,
        confidence: formData.confidence ? parseFloat(formData.confidence) / 100 : 0.94,
        aqiAtLocation: 112,
        weatherCondition: 'Partly cloudy',
      },
    };

    const currentList = getStoredComplaints();
    const updated = [newComplaint, ...currentList];
    saveStoredComplaints(updated);
    MOCK_COMPLAINTS.unshift(newComplaint);

    return successResponse(newComplaint);
  }
  const res = await apiClient.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// PATCH /api/complaints/:id
export const updateComplaint = async (id, payload) => {
  if (MOCK_MODE) {
    await mockDelay();
    const currentList = getStoredComplaints();
    const idx = currentList.findIndex((c) => c.id === id);
    if (idx >= 0) {
      currentList[idx] = { ...currentList[idx], ...payload };
      saveStoredComplaints(currentList);
      const mIdx = MOCK_COMPLAINTS.findIndex((c) => c.id === id);
      if (mIdx >= 0) Object.assign(MOCK_COMPLAINTS[mIdx], payload);
      return successResponse(currentList[idx]);
    }
    return successResponse({ id, ...payload });
  }
  const res = await apiClient.patch(`/complaints/${id}`, payload);
  return res.data;
};

// GET /api/complaints/map
export const getMapData = async (filters = {}) => {
  if (MOCK_MODE) {
    await mockDelay(500);
    const complaints = getStoredComplaints();
    return successResponse(
      complaints.map((c) => ({
        id: c.id,
        title: c.title,
        latitude: c.latitude,
        longitude: c.longitude,
        severity: c.severity,
        category: c.category,
        status: c.status,
        upvoteCount: c.upvoteCount,
        imageUrl: c.imageUrl,
        ward: c.ward,
      }))
    );
  }
  const res = await apiClient.get('/complaints/map', { params: filters });
  return res.data;
};

// GET /api/complaints/my-complaints
export const getMyComplaints = async (customUserId) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const sessionUser = getCurrentSessionUser();
    const targetId = customUserId || sessionUser?.id;
    if (!targetId) {
      return successResponse([]);
    }
    return successResponse(
      complaints.filter((c) => c.createdBy?.id === targetId || (sessionUser?.email && c.createdBy?.email === sessionUser.email))
    );
  }
  const res = await apiClient.get('/complaints/my-complaints');
  return res.data;
};

// GET /api/complaints/top-10/:ward
export const getTopComplaintsByWard = async (ward) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(
      MOCK_COMPLAINTS.filter((c) => c.ward === Number(ward))
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 10)
    );
  }
  const res = await apiClient.get(`/complaints/top-10/${ward}`);
  return res.data;
};

// POST /api/complaints/:id/upvote
export const upvoteComplaint = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(300);
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id);
    if (c) {
      c.upvoteCount = (c.upvoteCount || 0) + 1;
      saveStoredComplaints(complaints);
      const m = MOCK_COMPLAINTS.find((x) => x.id === id);
      if (m) m.upvoteCount = c.upvoteCount;
    }
    return successResponse({ upvoteCount: c?.upvoteCount || 0 });
  }
  const res = await apiClient.post(`/complaints/${id}/upvote`);
  return res.data;
};

// DELETE /api/complaints/:id/upvote
export const removeUpvote = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(300);
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id);
    if (c && c.upvoteCount > 0) {
      c.upvoteCount -= 1;
      saveStoredComplaints(complaints);
      const m = MOCK_COMPLAINTS.find((x) => x.id === id);
      if (m) m.upvoteCount = c.upvoteCount;
    }
    return successResponse({ upvoteCount: c?.upvoteCount || 0 });
  }
  const res = await apiClient.delete(`/complaints/${id}/upvote`);
  return res.data;
};

// GET /api/complaints/:id/comments
export const getComments = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(400);
    return successResponse(MOCK_COMMENTS[id] || []);
  }
  const res = await apiClient.get(`/complaints/${id}/comments`);
  return res.data;
};

// POST /api/complaints/:id/comments
export const addComment = async (id, { text, author }) => {
  if (MOCK_MODE) {
    await mockDelay(500);
    const sessionUser = getCurrentSessionUser();
    const authorObj = author || (sessionUser ? {
      id: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role || 'citizen',
    } : { id: 'anonymous', name: 'Citizen', role: 'citizen' });

    const newComment = {
      id: `comm-${Date.now()}`,
      author: authorObj,
      text,
      createdAt: new Date().toISOString(),
    };
    if (!MOCK_COMMENTS[id]) MOCK_COMMENTS[id] = [];
    MOCK_COMMENTS[id].push(newComment);
    return successResponse(newComment);
  }
  const res = await apiClient.post(`/complaints/${id}/comments`, { text, author });
  return res.data;
};
