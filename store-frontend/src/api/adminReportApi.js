import axiosClient from './axiosClient';

export const adminReportApi = {
  getSales: (params) => axiosClient.get('/api/admin/reports/sales', { params }),
  getBestSelling: (params) => axiosClient.get('/api/admin/reports/best-selling', { params }),
  getRevenue: (params) => axiosClient.get('/api/admin/reports/revenue', { params }),
  getCustomerPurchases: (params) => axiosClient.get('/api/admin/reports/customer-purchases', { params }),

  exportSales: (params) => axiosClient.get('/api/admin/reports/sales/export', { params, responseType: 'blob' }),
  exportBestSelling: (params) => axiosClient.get('/api/admin/reports/best-selling/export', { params, responseType: 'blob' }),
  exportRevenue: (params) => axiosClient.get('/api/admin/reports/revenue/export', { params, responseType: 'blob' }),
  exportCustomerPurchases: (params) =>
    axiosClient.get('/api/admin/reports/customer-purchases/export', { params, responseType: 'blob' }),
};