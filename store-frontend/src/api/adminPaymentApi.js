import axiosClient from './axiosClient';

export const adminPaymentApi = {
  list: (params) => axiosClient.get('/api/admin/payments', { params }),
  getForOrder: (orderId) => axiosClient.get(`/api/admin/payments/order/${orderId}`),
  updateStatus: (paymentId, payload) => axiosClient.patch(`/api/admin/payments/${paymentId}/status`, payload),
};