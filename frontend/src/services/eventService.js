import api from './api';

export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getTrending: () => api.get('/events/trending'),
  getSpiritual: () => api.get('/events/spiritual'),
  getMovies: () => api.get('/events/movies'),
  getNearby: (params) => api.get('/events/nearby', { params }),
  getOrganizerEvents: () => api.get('/events/organizer/mine'),
  getPending: () => api.get('/events/admin/pending'),
  create: (formData) => api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/events/${id}`),
  approve: (id, status) => api.patch(`/events/${id}/status`, { status }),
};
