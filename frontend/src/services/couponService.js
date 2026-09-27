import api from './api';

export const couponService = {
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
  getAll: () => api.get('/coupons'),
};
