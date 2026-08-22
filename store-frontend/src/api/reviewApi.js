// Reverted file
import axiosClient from './axiosClient';
export const reviewApi = {
  // Public / Customer read
  getProductReviews: (productId, params) => axiosClient.get(`/api/products/${productId}/reviews`, { params }),
  getReviewSummary: (productId) => axiosClient.get(`/api/products/${productId}/reviews/summary`),
  // Customer write / delete
  submitReview: (productId, payload) => axiosClient.put(`/api/customer/products/${productId}/review`, payload),
  deleteMyReview: (productId, reviewId) => axiosClient.delete(`/api/customer/products/${productId}/review/${reviewId}`),
  // Admin moderation
  adminListReviews: (productId, params) => axiosClient.get(`/api/admin/products/${productId}/reviews`, { params }),
  adminDeleteReview: (productId, reviewId) => axiosClient.delete(`/api/admin/products/${productId}/reviews/${reviewId}`),
};