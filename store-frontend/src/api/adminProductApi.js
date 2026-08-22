import axiosClient from './axiosClient';

export const adminProductApi = {
  search: (params) => axiosClient.get('/api/admin/products', { params }),
  getById: (id) => axiosClient.get(`/api/admin/products/${id}`),
  create: (payload) => axiosClient.post('/api/admin/products', payload),
  update: (id, payload) => axiosClient.put(`/api/admin/products/${id}`, payload),
  remove: (id) => axiosClient.delete(`/api/admin/products/${id}`),
  setStatus: (id, status) => axiosClient.patch(`/api/admin/products/${id}/status`, null, { params: { status } }),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/api/admin/products/${id}/images`, formData);
  },
  addImageUrl: (id, url) => axiosClient.post(`/api/admin/products/${id}/images/url`, { url }, { params: { url } }),
  deleteImage: (id, imageId) => axiosClient.delete(`/api/admin/products/${id}/images/${imageId}`),
};