import api from './api';

export const bookingService = {
  getSeats: (eventId) => api.get(`/bookings/seats/${eventId}`),
  holdSeats: (data) => api.post('/bookings/hold', data),
  createOrder: (data) => api.post('/bookings/order', data),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  verifyPayment: (data) => api.post('/bookings/verify', data), // alias → payments/verify-booking
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  getOrganizerBookings: () => api.get('/bookings/organizer/list'),
  getAnalytics: () => api.get('/bookings/organizer/analytics'),
  donate: (data) => api.post('/bookings/donate', data),
};
