import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_OFFICERS, MOCK_COMPLAINTS, OFFICER_PERFORMANCE } from '../utils/mockData';

// GET /api/officers
export const getOfficers = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(MOCK_OFFICERS);
  }
  const res = await apiClient.get('/officers');
  return res.data;
};

// GET /api/officers/:id/performance
export const getOfficerPerformance = async (id) => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(OFFICER_PERFORMANCE);
  }
  const res = await apiClient.get(`/officers/${id}/performance`);
  return res.data;
};

// GET /api/authority/dashboard
export const getAuthorityDashboard = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    const assigned = MOCK_COMPLAINTS.filter((c) =>
      c.assignedOfficer?.id === 'officer-001'
    );
    return successResponse({
      assignedCount: assigned.length,
      inProgressCount: assigned.filter((c) => c.status === 'in_progress').length,
      resolvedThisMonth: 23,
      avgResolutionDays: 4.2,
      priorityQueue: assigned.sort((a, b) => b.severity - a.severity),
    });
  }
  const res = await apiClient.get('/authority/dashboard');
  return res.data;
};

// GET /api/authority/my-assignments
export const getMyAssignments = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(
      MOCK_COMPLAINTS.filter((c) => c.assignedOfficer?.id === 'officer-001')
    );
  }
  const res = await apiClient.get('/authority/my-assignments');
  return res.data;
};

// GET /api/authority/performance
export const getMyPerformance = async () => {
  if (MOCK_MODE) {
    await mockDelay();
    return successResponse(OFFICER_PERFORMANCE);
  }
  const res = await apiClient.get('/authority/performance');
  return res.data;
};

// PATCH /api/authority/complaints/:id/assign
export const assignComplaint = async (id, { officerId }) => {
  if (MOCK_MODE) {
    await mockDelay(500);
    const c = MOCK_COMPLAINTS.find((x) => x.id === id);
    const officer = MOCK_OFFICERS.find((o) => o.id === officerId);
    if (c && officer) {
      c.assignedOfficer = { id: officer.id, name: officer.name };
      c.status = 'assigned';
    }
    return successResponse(c);
  }
  const res = await apiClient.patch(`/authority/complaints/${id}/assign`, { officerId });
  return res.data;
};

// PATCH /api/authority/complaints/:id/resolve
export const resolveComplaint = async (id, { notes, resolutionImageUrl }) => {
  if (MOCK_MODE) {
    await mockDelay(700);
    const c = MOCK_COMPLAINTS.find((x) => x.id === id);
    if (c) {
      c.status = 'resolved';
      c.resolvedAt = new Date().toISOString();
    }
    return successResponse(c);
  }
  const res = await apiClient.patch(`/authority/complaints/${id}/resolve`, { notes, resolutionImageUrl });
  return res.data;
};
