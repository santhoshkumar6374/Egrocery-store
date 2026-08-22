import axiosClient from './axiosClient';

export const addressApi = {
  list: () => axiosClient.get('/api/users/me/addresses'),
  add: (payload) => axiosClient.post('/api/users/me/addresses', payload),
  remove: (addressId) => axiosClient.delete(`/api/users/me/addresses/${addressId}`),
};