import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getOrganizers: () => api.get('/admin/organizers'),
  verifyOrganizer: (id) => api.patch(`/admin/organizers/${id}/verify`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
};
