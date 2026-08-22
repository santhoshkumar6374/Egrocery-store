import axiosClient from './axiosClient';

export const adminCouponApi = {
  list: (params) => axiosClient.get('/api/admin/coupons', { params }),
  getById: (id) => axiosClient.get(`/api/admin/coupons/${id}`),
  create: (payload) => axiosClient.post('/api/admin/coupons', payload),
  update: (id, payload) => axiosClient.put(`/api/admin/coupons/${id}`, payload),
  remove: (id) => axiosClient.delete(`/api/admin/coupons/${id}`),
};