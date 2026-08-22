import axiosClient from './axiosClient';

export const adminInventoryApi = {
  list: (params) => axiosClient.get('/api/admin/inventory', { params }),
  lowStock: () => axiosClient.get('/api/admin/inventory/low-stock'),
  outOfStock: () => axiosClient.get('/api/admin/inventory/out-of-stock'),
  getByProduct: (productId) => axiosClient.get(`/api/admin/inventory/${productId}`),
  updateStock: (productId, payload) => axiosClient.put(`/api/admin/inventory/${productId}/stock`, payload),
  getHistory: (productId, params) => axiosClient.get(`/api/admin/inventory/${productId}/history`, { params }),
};