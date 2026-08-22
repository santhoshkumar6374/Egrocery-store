import axiosClient from './axiosClient';

export const deliveryApi = {
  estimate: (addressId) => axiosClient.get('/api/customer/delivery/estimate', { params: { addressId } }),
};