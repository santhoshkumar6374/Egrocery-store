import axiosClient from './axiosClient';

export const wishlistApi = {
  list: () => axiosClient.get('/api/customer/wishlist'),
  add: (productId) => axiosClient.post(`/api/customer/wishlist/${productId}`),
  remove: (productId) => axiosClient.delete(`/api/customer/wishlist/${productId}`),
};