import axiosClient from './axiosClient';

export const cartApi = {
  get: () => axiosClient.get('/api/customer/cart'),
  addItem: (productId, quantity) => axiosClient.post('/api/customer/cart/items', { productId, quantity }),
  updateItem: (itemId, quantity) => axiosClient.put(`/api/customer/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => axiosClient.delete(`/api/customer/cart/items/${itemId}`),
  applyCoupon: (code) => axiosClient.post('/api/customer/cart/coupon', { code }),
  removeCoupon: () => axiosClient.delete('/api/customer/cart/coupon'),
};