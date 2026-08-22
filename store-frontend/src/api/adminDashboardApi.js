import axiosClient from './axiosClient';

export const adminDashboardApi = {
  getSummary: () => axiosClient.get('/api/admin/dashboard/summary'),
};