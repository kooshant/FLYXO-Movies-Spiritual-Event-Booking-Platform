import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flyxo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    let message = err.response?.data?.message;

    if (!message) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        message =
          'Cannot reach server. Start backend: cd backend && npm run dev (port 5000)';
      } else if (err.response?.status === 503) {
        message = err.response?.data?.message || 'Database not connected. Check backend/.env';
      } else {
        message = err.message || 'Something went wrong';
      }
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('flyxo_token');
      localStorage.removeItem('flyxo_user');
    }
    return Promise.reject({ message, status: err.response?.status, errors: err.response?.data?.errors });
  }
);

export default api;
