import axiosClient from './axiosClient';

export const adminOrderApi = {
  list: (params) => axiosClient.get('/api/admin/orders', { params }),
  getById: (id) => axiosClient.get(`/api/admin/orders/${id}`),
  updateStatus: (id, status) => axiosClient.patch(`/api/admin/orders/${id}/status`, { status }),
};