import axiosClient from './axiosClient';

export const paymentApi = {
  initiate: (orderId) => axiosClient.post(`/api/customer/orders/${orderId}/payments/initiate`),
  verify: (orderId, payload) => axiosClient.post(`/api/customer/orders/${orderId}/payments/verify`, payload),
  list: (orderId) => axiosClient.get(`/api/customer/orders/${orderId}/payments`),
};