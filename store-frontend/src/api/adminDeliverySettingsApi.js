import axiosClient from './axiosClient';

export const adminDeliverySettingsApi = {
  get: () => axiosClient.get('/api/admin/delivery-settings'),
  update: (payload) => axiosClient.put('/api/admin/delivery-settings', payload),
};