import axiosClient from './axiosClient';

export const reportsApi = {
  async getDailyReport(date) {
    const res = await axiosClient.get('/reports/daily', { params: { date } });
    return res.data;
  },

  async getMonthToDateReport(date) {
    const res = await axiosClient.get('/reports/month-to-date', { params: { date } });
    return res.data;
  },

  async getMonthlyReport(date) {
    const res = await axiosClient.get('/reports/monthly', { params: { date } });
    return res.data;
  }
};

