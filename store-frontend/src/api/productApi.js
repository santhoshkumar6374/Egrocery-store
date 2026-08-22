import axiosClient from './axiosClient';

export const productApi = {
  search: (params) => axiosClient.get('/api/products', { params }),
  getById: (id) => axiosClient.get(`/api/products/${id}`),
  getReviews: (productId, params) => axiosClient.get(`/api/products/${productId}/reviews`, { params }),
  getReviewSummary: (productId) => axiosClient.get(`/api/products/${productId}/reviews/summary`),
};

export const categoryApi = {
  list: () => axiosClient.get('/api/categories'),
  getById: (id) => axiosClient.get(`/api/categories/${id}`),
};