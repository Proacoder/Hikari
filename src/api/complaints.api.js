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
    if (ward) {
      data = data.filter((c) =>
        Number(c.ward) === Number(ward) ||
        String(c.ward).toLowerCase() === String(ward).toLowerCase() ||
        (c.wardName && String(c.wardName).toLowerCase().includes(String(ward).toLowerCase()))
      );
    }
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
    await mockDelay();
    const uploadedImage = (typeof formData.get === 'function' && (formData.get('imageUrl') || formData.get('image')))
      || (formData.imageUrl || formData.image);
    const defaultImg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';

    const lat = (typeof formData.get === 'function'
      ? Number(formData.get('latitude') || formData.get('lat'))
      : (formData.latitude || formData.lat)) || 19.076;
    const lng = (typeof formData.get === 'function'
      ? Number(formData.get('longitude') || formData.get('lng'))
      : (formData.longitude || formData.lng)) || 72.877;
    const wardId = (typeof formData.get === 'function'
      ? Number(formData.get('ward'))
      : formData.ward) || 1;
    const landmark = (typeof formData.get === 'function' && formData.get('landmark'))
      || (formData.landmark || '');

    const newComplaint = {
      id: `cmp-${Date.now()}`,
      title: (typeof formData.get === 'function' && formData.get('title'))
        || formData.title,
      description: (typeof formData.get === 'function' && formData.get('description'))
        || formData.description,
      category: (typeof formData.get === 'function' && formData.get('category'))
        || formData.category,
      severity: (typeof formData.get === 'function' && formData.get('severity'))
        ? Number(formData.get('severity'))
        : (Number(formData.severity) || Math.floor(Math.random() * 30) + 55),
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
        categoryDetected: (typeof formData.get === 'function' && formData.get('category'))
          || formData.category,
        confidence: formData.confidence
          ? (parseFloat(formData.confidence) > 1
            ? parseFloat(formData.confidence) / 100
            : parseFloat(formData.confidence))
          : 0.94,
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

  const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
  const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
  const res = await apiClient.post('/complaints', formData, config);
  if (res.data?.data) {
    const currentList = getStoredComplaints();
    const updated = [res.data.data, ...currentList.filter((c) => c.id !== res.data.data.id)];
    saveStoredComplaints(updated);
    MOCK_COMPLAINTS.unshift(res.data.data);
  }
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
    // If complaint not found in storage, still return success but don't modify MOCK_COMPLAINTS
    return successResponse({ id, ...payload });
  }
  const res = await apiClient.patch(`/complaints/${id}`, payload);
  if (res.data?.data) {
    const currentList = getStoredComplaints();
    const idx = currentList.findIndex((c) => c.id === id);
    if (idx >= 0) {
      currentList[idx] = { ...currentList[idx], ...res.data.data };
      saveStoredComplaints(currentList);
    }
  }
  return res.data;
};

// GET /api/complaints/map
export const getMapData = async (filters = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
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

// POST /api/complaints/:id/upvote
export const upvoteComplaint = async (id) => {
  if (MOCK_MODE) {
    await mockDelay();
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

// GET /api/complaints/:id/comments
export const getComments = async (id) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_COMMENTS[id] || []);
  }
  const res = await apiClient.get(`/complaints/${id}/comments`);
  return res.data;
};

// POST /api/complaints/:id/comments
export const addComment = async (id, { text, author }) => {
  if (MOCK_MODE) {
    await mockDelay();
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

// ── Phase 2: Citizen Feedback & Anti-Abuse Re-open Protocol ───────────────────

// POST /api/complaints/:id/reopen
export const reopenComplaint = async (id, { reason, photoUrl }) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id);
    if (!c) throw { response: { data: { success: false, detail: 'Complaint not found' } } };

    if (c.isPermanentlyLocked) {
      throw { response: { data: { success: false, detail: 'Resolution Final: Grievance has been permanently affirmed by the Superintending Engineer.' } } };
    }
    if ((c.reopenCount || 0) >= 1) {
      throw { response: { data: { success: false, detail: 'Anti-Abuse Limit: A resolution may only be contested once per MCGM Bylaws.' } } };
    }
    if (c.status !== 'resolved') {
      throw { response: { data: { success: false, detail: 'Only resolved grievances can be contested.' } } };
    }
    if (!reason || reason.trim().length < 10) {
      throw { response: { data: { success: false, detail: 'Please provide at least 10 characters detailing why repair is deficient.' } } };
    }
    if (!photoUrl) {
      throw { response: { data: { success: false, detail: 'Photographic evidence is mandatory under MCGM Bylaws.' } } };
    }

    c.status = 'reopened';
    c.reopenCount = (c.reopenCount || 0) + 1;
    c.reopenedAt = new Date().toISOString();
    c.reopenReason = reason;
    c.reopenPhotoUrl = photoUrl;
    saveStoredComplaints(complaints);
    return successResponse(c);
  }
  const res = await apiClient.post(`/complaints/${id}/reopen`, { reason, photoUrl });
  return res.data;
};

// POST /api/complaints/:id/affirm
export const affirmComplaint = async (id, { notes, auditPhotoUrl } = {}) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id);
    if (!c) throw { response: { data: { success: false, detail: 'Complaint not found' } } };

    c.status = 'resolved';
    c.isPermanentlyLocked = true;
    c.resolvedAt = new Date().toISOString();
    saveStoredComplaints(complaints);
    return successResponse(c);
  }
  const res = await apiClient.post(`/complaints/${id}/affirm`, { notes, auditPhotoUrl });
  return res.data;
};

// POST /api/complaints/:id/feedback
export const submitComplaintFeedback = async (id, { rating, tags, comment }) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id);
    if (c) {
      c.rating = rating;
      c.feedbackTags = tags;
      c.feedbackComment = comment;
      saveStoredComplaints(complaints);
    }
    return successResponse(c);
  }
  const res = await apiClient.post(`/complaints/${id}/feedback`, { rating, tags, comment });
  return res.data;
};

// GET /api/complaints/:id/whatsapp
export const getComplaintWhatsApp = async (id) => {
  if (MOCK_MODE) {
    await mockDelay();
    const complaints = getStoredComplaints();
    const c = complaints.find((x) => x.id === id) || { id, title: 'Civic Grievance', ward: 8, category: 'Pothole', status: 'resolved' };
    const text = `🏛️ *BRIHANMUMBAI MUNICIPAL CORPORATION (MCGM)*\n📋 *Official Grievance Receipt*\n• *Ticket ID:* #${c.id}\n• *Title:* ${c.title}\n• *Ward:* Ward #${c.ward}\n• *Status:* ${c.status?.toUpperCase()}\n• *Live Tracker:* https://kaiser.mcgm.gov.in/app/complaints/${c.id}\n----------------------------------\n_Kaiser AI BMC Municipal Operations_`;
    const encoded = encodeURIComponent(text);
    return successResponse({
      complaintId: c.id,
      message: text,
      shareUrl: `https://api.whatsapp.com/send?text=${encoded}`,
      botUrl: `https://api.whatsapp.com/send?phone=919869407777&text=${encodeURIComponent('STATUS ' + c.id)}`,
      bmcHelpline: '+91 98694 07777',
    });
  }
  const res = await apiClient.get(`/complaints/${id}/whatsapp`);
  return res.data;
};

// GET /api/citizens/:userId/certificate
export const getCitizenCertificate = async (userId) => {
  if (MOCK_MODE) {
    await mockDelay();
    const sessionUser = getCurrentSessionUser();
    const name = sessionUser?.name || 'Priya Nair';
    const wardName = sessionUser?.wardName || 'G/N Ward – Bandra (North)';
    return successResponse({
      certificateId: 'BMC-CIVIC-2026-PN8842',
      citizenName: name,
      wardName,
      civicKarma: 840,
      issuesResolved: 14,
      totalReports: 18,
      issueDate: 'October 2026',
      authorizedBy: 'Rajendra Mehta, IAS',
      designation: 'Municipal Commissioner, Greater Mumbai',
      verificationHash: 'A8F9-2026-C4B1-MCGM',
      verificationUrl: 'https://kaiser.mcgm.gov.in/verify-certificate/BMC-CIVIC-2026-PN8842',
    });
  }
  const res = await apiClient.get(`/citizens/${userId}/certificate`);
  return res.data;
};
