import axiosClient from './axiosClient';

export const authApi = {
  register: (payload) => axiosClient.post('/api/auth/register', payload),
  login: (payload) => axiosClient.post('/api/auth/login', payload),
  logout: (refreshToken) => axiosClient.post('/api/auth/logout', { refreshToken }),
  getProfile: () => axiosClient.get('/api/users/me'),
};