import api from './api';

export const paymentService = {
  getConfig: () => api.get('/payments/config'),
  verifyBooking: (data) => api.post('/payments/verify-booking', data),
  verifyDonation: (data) => api.post('/payments/verify-donation', data),
};
