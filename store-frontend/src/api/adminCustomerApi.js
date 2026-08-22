import axiosClient from './axiosClient';

export const adminCustomerApi = {
  search: (params) => axiosClient.get('/api/admin/customers', { params }),
  getById: (id) => axiosClient.get(`/api/admin/customers/${id}`),
  getOrders: (id, params) => axiosClient.get(`/api/admin/customers/${id}/orders`, { params }),
  setStatus: (id, status) => axiosClient.patch(`/api/admin/customers/${id}/status`, null, { params: { status } }),
  remove: (id) => axiosClient.delete(`/api/admin/customers/${id}`),
};