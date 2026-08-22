import axiosClient from './axiosClient';

export const orderApi = {
  place: (payload) => axiosClient.post('/api/customer/orders', payload),
  list: (params) => axiosClient.get('/api/customer/orders', { params }),
  getById: (orderId) => axiosClient.get(`/api/customer/orders/${orderId}`),
  cancel: (orderId) => axiosClient.post(`/api/customer/orders/${orderId}/cancel`),
};