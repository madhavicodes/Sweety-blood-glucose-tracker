import axiosClient from './axiosClient';

export const readingsApi = {
  async createReading(data) {
    const res = await axiosClient.post('/readings', data);
    return res.data;
  },

  async getReadingsByDate(date) {
    const res = await axiosClient.get('/readings', { params: { date } });
    return res.data;
  },

  async getReadingsRange(params) {
    const res = await axiosClient.get('/readings', { params });
    return res.data;
  },

  async getReadingById(id) {
    const res = await axiosClient.get(`/readings/${id}`);
    return res.data;
  },

  async updateReading(id, data) {
    const res = await axiosClient.put(`/readings/${id}`, data);
    return res.data;
  },

  async deleteReading(id) {
    const res = await axiosClient.delete(`/readings/${id}`);
    return res.data;
  }
};

