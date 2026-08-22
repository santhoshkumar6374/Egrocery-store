// Reverted file
import axiosClient from './axiosClient';
export const userApi = {
  getProfile: () => axiosClient.get('/api/users/me'),
  updateProfile: (payload) => axiosClient.put('/api/users/me', payload),
  changePassword: (payload) => axiosClient.put('/api/users/me/password', payload),
};