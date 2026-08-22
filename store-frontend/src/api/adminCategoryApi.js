import axiosClient from './axiosClient';

export const adminCategoryApi = {
  list: () => axiosClient.get('/api/admin/categories'),
  getById: (id) => axiosClient.get(`/api/admin/categories/${id}`),
  create: (payload) => axiosClient.post('/api/admin/categories', payload),
  update: (id, payload) => axiosClient.put(`/api/admin/categories/${id}`, payload),
  remove: (id) => axiosClient.delete(`/api/admin/categories/${id}`),
};